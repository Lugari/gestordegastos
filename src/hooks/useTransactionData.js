import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as TransactionService from '../services/transactionService';
import * as BucketService from '../services/bucketService';
import { getStrategy } from '../domain/strategyByKind';
import { kindFromTransactionType } from '../constants/bucketKinds';

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
  if (!targetId || !targetKind) return;
  const strategy = getStrategy(targetKind);
  if (!strategy?.applyTransaction) return;

  const buckets = await BucketService.getAllBuckets();
  const bucket = buckets.find((b) => b.id === targetId);
  if (!bucket) return;

  const patch = strategy.applyTransaction(bucket, signedAmount);
  await BucketService.updateBucketById(targetId, patch);
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

      // Ajuste de saldo del bucket, agnóstico al tipo.
      await applyBucketDelta(targetId, targetKind, transactionData.amount);

      return newTransaction;
    },
    ...mutationOptions,
  });

  // Mutación para BORRAR
  const deleteMutation = useMutation({
    mutationFn: async ({ transactionId, budgetId, amount, type, targetKind }) => {
      // Acepta targetKind explícito o lo deriva del tipo (compatibilidad).
      const kind = targetKind ?? kindFromTransactionType(type);
      await applyBucketDelta(budgetId, kind, -amount); // revierte el saldo
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
