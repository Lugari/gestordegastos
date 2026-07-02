import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import * as BucketService from '../services/bucketService';
import { KIND } from '../constants/bucketKinds';
import { scheduleReminder, cancelReminder, nextMonthlyOccurrence } from '../services/notificationsService';

// Recordatorio de facturación para tarjetas de crédito: programa (o cancela) una
// notificación local en la próxima fecha de facturación del bucket de deuda.
const syncDebtReminder = async (kind, bucket) => {
  if (kind !== KIND.DEBT || !bucket?.id) return;
  const key = `debt-${bucket.id}`;
  if (bucket.type === 'credit card' && bucket.date) {
    const next = nextMonthlyOccurrence(bucket.date);
    if (next) {
      await scheduleReminder(key, 'Recordatorio de pago', `Tu tarjeta "${bucket.name}" factura pronto.`, next);
      return;
    }
  }
  await cancelReminder(key);
};

// Hooks genéricos sobre el store unificado @buckets.
// Los hooks por dominio (useBudgetsData, etc.) son envoltorios finos sobre estos.
//
// `queryKey` se deja parametrizable: en Fase 2 los envoltorios pasan las claves
// legadas (['budgets'], ['savings'], ['debts']) para no alterar el resto del
// código (p. ej. useManageTransactions). Más adelante se podrán unificar.

export const useGetBuckets = (kind, queryKey = ['buckets', kind]) =>
  useQuery({
    queryKey,
    queryFn: () => BucketService.getBucketsByKind(kind),
  });

export const useManageBuckets = (kind, queryKey = ['buckets', kind]) => {
  const queryClient = useQueryClient();

  const onSuccess = () => {
    queryClient.invalidateQueries({ queryKey });
    queryClient.invalidateQueries({ queryKey: ['transactions'] });
  };
  const onError = (error) => console.error(`Error en la mutación de ${kind}:`, error);

  const addMutation = useMutation({
    mutationFn: async (data) => {
      const created = await BucketService.addBucket(kind, data);
      await syncDebtReminder(kind, created);
      return created;
    },
    onSuccess,
    onError,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await cancelReminder(`debt-${id}`);
      return BucketService.deleteBucketById(id);
    },
    onSuccess,
    onError,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }) => {
      const updated = await BucketService.updateBucketById(id, updates);
      await syncDebtReminder(kind, updated);
      return updated;
    },
    onSuccess,
    onError,
  });

  return { addMutation, deleteMutation, updateMutation };
};
