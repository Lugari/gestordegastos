import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import * as BudgetService from "../services/budgetService";

export const useGetBudgets = () => {
    return useQuery({
        queryKey: ["budgets"],
        queryFn: BudgetService.getAllBudgets

    });
}

export const useManageBudgets = () => {
    const queryClient = useQueryClient();

    const mutationOptions = {
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['budgets'] }); 
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
        },
        onError: (error) => {
            console.error("Error en la mutación del presupuesto:", error);
        },
    };

    const addMutation = useMutation({
        mutationFn: BudgetService.addBudget,
        ...mutationOptions,
    });

    const deleteMutation = useMutation({
        mutationFn: BudgetService.deleteBudgetById,
        ...mutationOptions,
        onSuccess: (data) => {
            queryClient.invalidateQueries(["budgets"]);
        },
    });

    const updateMutation = useMutation({
        mutationFn: (variables) => BudgetService.updateBudgetById(variables.id, variables.updates),
        ...mutationOptions,
    });

    return {
        addBudget: addMutation.mutateAsync,
        deleteBudget: deleteMutation.mutateAsync,
        updateBudget: updateMutation.mutateAsync,
        isAdding: addMutation.isPending,
        isDeleting: deleteMutation.isPending,
        isUpdating: updateMutation.isPending,
    };
}
