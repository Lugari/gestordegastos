import { useGetBuckets, useManageBuckets } from './useBucketData';
import { KIND } from '../constants/bucketKinds';

// Envoltorio del modelo unificado: ahorros = buckets de kind 'saving'.
// Conserva la clave legada ['savings'] y la misma API para no tocar las pantallas.

export const useGetSavings = () => useGetBuckets(KIND.SAVING, ['savings']);

export const useManageSavings = () => {
    const { addMutation, deleteMutation, updateMutation } = useManageBuckets(KIND.SAVING, ['savings']);

    return {
        addSaving: addMutation.mutateAsync,
        deleteSaving: deleteMutation.mutateAsync,
        updateSaving: updateMutation.mutateAsync,
        isAdding: addMutation.isPending,
        isDeleting: deleteMutation.isPending,
        isUpdating: updateMutation.isPending,
    };
};
