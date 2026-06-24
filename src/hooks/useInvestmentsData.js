import { useGetBuckets, useManageBuckets } from './useBucketData';
import { KIND } from '../constants/bucketKinds';

// Envoltorio del modelo unificado: inversiones = buckets de kind 'investment'.
// Mismo patrón que presupuestos/ahorros/deudas; el refactor hace que añadir un
// nuevo tipo sea casi gratis.

export const useGetInvestments = () => useGetBuckets(KIND.INVESTMENT, ['investments']);

export const useManageInvestments = () => {
    const { addMutation, deleteMutation, updateMutation } = useManageBuckets(KIND.INVESTMENT, ['investments']);

    return {
        addInvestment: addMutation.mutateAsync,
        deleteInvestment: deleteMutation.mutateAsync,
        updateInvestment: updateMutation.mutateAsync,
        isAdding: addMutation.isPending,
        isDeleting: deleteMutation.isPending,
        isUpdating: updateMutation.isPending,
    };
};
