import { useGetBuckets, useManageBuckets } from './useBucketData';
import { KIND } from '../constants/bucketKinds';

// Envoltorio del modelo unificado: presupuestos = buckets de kind 'budget'.
// Conserva la clave legada ['budgets'] y la misma API para no tocar las pantallas.

export const useGetBudgets = () => useGetBuckets(KIND.BUDGET, ['budgets']);

export const useManageBudgets = () => {
    const { addMutation, deleteMutation, updateMutation } = useManageBuckets(KIND.BUDGET, ['budgets']);

    return {
        addBudget: addMutation.mutateAsync,
        deleteBudget: deleteMutation.mutateAsync,
        updateBudget: updateMutation.mutateAsync,
        isAdding: addMutation.isPending,
        isDeleting: deleteMutation.isPending,
        isUpdating: updateMutation.isPending,
    };
};
