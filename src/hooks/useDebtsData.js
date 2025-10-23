import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as DebtService from "../services/debtService";

export const useGetDebts = () => {
    return useQuery({
        queryKey: ["debts"],
        queryFn: DebtService.getAllDebts
    });
}

export const useManageDebts = () => {
    const queryClient = useQueryClient();

    const mutationOptions = {
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['debts'] });
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
        },
        onError: (error) => {
            console.error("Error in debt mutation:", error);
        },
    };

    const addMutation = useMutation({
        mutationFn: DebtService.addDebt,
        ...mutationOptions,
    });

    const deleteMutation = useMutation({
        mutationFn: DebtService.deleteDebtById,
        ...mutationOptions,
    });

    const updateMutation = useMutation({
        mutationFn: (variables) => DebtService.updateDebtById(variables.id, variables.updates),
        ...mutationOptions,
    });

    return {
        addDebt: addMutation.mutateAsync,
        deleteDebt: deleteMutation.mutateAsync,
        updateDebt: updateMutation.mutateAsync,
        isAdding: addMutation.isPending,
        isDeleting: deleteMutation.isPending,
        isUpdating: updateMutation.isPending,
    };
}