import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as TransactionService from '../services/transactionService';
import * as BucketService from '../services/bucketService';
import { getStrategy } from '../domain/strategyByKind';
import { KIND, kindFromTransactionType } from '../constants/bucketKinds';
import { toBase } from '../utils/formatMoney';
import { notifyNow } from '../services/notificationsService';

export const useGetTransactions = () => {
  return useQuery({
    queryKey: ['transactions'],
    queryFn: TransactionService.getAllTransactions,
  });
  // devuelve { data, isLoading, isError, error, refetch, ... }
};

// Ajusta el saldo "usado" del bucket destino aplicando la estrategia del kind.
// `signedAmount` es positivo al añadir una transacción y negativo al revertirla.
// Funciona para cualquier kind (presupuesto, ahorro, deuda, inversión) sin ramas por tipo.
const applyBucketDelta = async (targetId, targetKind, signedAmount) => {
  if (!targetId || !targetKind) return null;
  const strategy = getStrategy(targetKind);
  if (!strategy?.applyTransaction) return null;

  const buckets = await BucketService.getAllBuckets();
  const bucket = buckets.find((b) => b.id === targetId);
  if (!bucket) return null;

  const patch = strategy.applyTransaction(bucket, signedAmount);
  await BucketService.updateBucketById(targetId, patch);

  // Datos para evaluar el cruce de umbral del presupuesto.
  return {
    kind: targetKind,
    name: bucket.name,
    total: Number(bucket.total) || 0,
    prevUsed: Number(bucket.used) || 0,
    newUsed: Number(patch.used) || 0,
  };
};

// Notifica cuando un gasto cruza el 80% o el 100% del presupuesto (solo al cruzar,
// no en cada gasto). Requiere notificaciones activadas (si no, es no-op).
const THRESHOLDS = [0.8, 1];
const maybeNotifyBudget = async (info) => {
  if (!info || info.kind !== KIND.BUDGET || info.total <= 0) return;
  const prev = info.prevUsed / info.total;
  const now = info.newUsed / info.total;
  for (const t of THRESHOLDS) {
    if (prev < t && now >= t) {
      const pct = Math.round(now * 100);
      const title = t >= 1 ? 'Presupuesto superado' : 'Presupuesto casi agotado';
      await notifyNow(title, `${info.name}: llevas ${pct}% de tu presupuesto.`);
      break; // una sola alerta por transacción
    }
  }
};

export const useManageTransactions = () => {
  const queryClient = useQueryClient(); // Obtiene el cliente para invalidar caché

  const mutationOptions = {
    onSuccess: () => {
      // invalida las queries para que React Query las recargue automáticamente
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['savings'] });
      queryClient.invalidateQueries({ queryKey: ['debts'] });
    },
    onError: (error) => {
      console.error('Error en la mutación de transacción:', error);
    },
  };

  // Mutación para AÑADIR
  const addMutation = useMutation({
    mutationFn: async (transactionData) => {
      // Vínculo unificado: derivamos el bucket destino a partir del tipo.
      const targetKind = kindFromTransactionType(transactionData.type);
      const targetId = transactionData.budget_id ?? null;

      // Persistimos target_id/target_kind en la transacción (modelo unificado).
      const enriched = { ...transactionData, target_id: targetId, target_kind: targetKind };
      const newTransaction = await TransactionService.addTransaction(enriched);

      // Ajuste de saldo del bucket (en moneda base): se convierte el monto desde
      // la moneda de la transacción.
      const deltaInfo = await applyBucketDelta(targetId, targetKind, toBase(transactionData.amount, transactionData.currency));

      // Alerta de presupuesto si este gasto cruzó un umbral.
      await maybeNotifyBudget(deltaInfo);

      return newTransaction;
    },
    ...mutationOptions,
  });

  // Mutación para BORRAR
  const deleteMutation = useMutation({
    mutationFn: async ({ transactionId, budgetId, amount, type, targetKind, currency }) => {
      // Acepta targetKind explícito o lo deriva del tipo (compatibilidad).
      const kind = targetKind ?? kindFromTransactionType(type);
      await applyBucketDelta(budgetId, kind, -toBase(amount, currency)); // revierte el saldo (en base)
      await TransactionService.deleteTransactionById(transactionId);
    },
    ...mutationOptions,
  });

  // Mutación para ACTUALIZAR
  const updateMutation = useMutation({
    // mutationFn espera un objeto { id, updates }
    mutationFn: (variables) => TransactionService.updateTransactionById(variables.id, variables.updates),
    ...mutationOptions,
  });

  return {
    addTransaction: addMutation.mutateAsync, // Usamos mutateAsync para poder usar await si es necesario
    deleteTransaction: deleteMutation.mutateAsync,
    updateTransaction: updateMutation.mutateAsync,
    isAdding: addMutation.isPending, // Puedes usar estos estados en la UI
    isDeleting: deleteMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
};
