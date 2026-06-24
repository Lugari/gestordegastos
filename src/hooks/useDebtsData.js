import { useGetBuckets, useManageBuckets } from './useBucketData';
import { KIND } from '../constants/bucketKinds';

// Envoltorio del modelo unificado: deudas = buckets de kind 'debt'.
// Conserva la clave legada ['debts'] y la misma API para no tocar las pantallas.

export const useGetDebts = () => useGetBuckets(KIND.DEBT, ['debts']);

export const useManageDebts = () => {
    const { addMutation, deleteMutation, updateMutation } = useManageBuckets(KIND.DEBT, ['debts']);

    return {
        addDebt: addMutation.mutateAsync,
        deleteDebt: deleteMutation.mutateAsync,
        updateDebt: updateMutation.mutateAsync,
        isAdding: addMutation.isPending,
        isDeleting: deleteMutation.isPending,
        isUpdating: updateMutation.isPending,
    };
};
