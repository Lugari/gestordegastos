import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import * as BucketService from '../services/bucketService';

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
    mutationFn: (data) => BucketService.addBucket(kind, data),
    onSuccess,
    onError,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => BucketService.deleteBucketById(id),
    onSuccess,
    onError,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }) => BucketService.updateBucketById(id, updates),
    onSuccess,
    onError,
  });

  return { addMutation, deleteMutation, updateMutation };
};
