import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import * as SavingService from "../services/savingService";

export const useGetSavings = () => {
    return useQuery({
        queryKey: ["savings"],
        queryFn: SavingService.getAllSavings

    });
}

export const useManageSavings = () => {
    const queryClient = useQueryClient();

    const mutationOptions = {
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['savings'] }); 
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
        },
        onError: (error) => {
            console.error("Error en la mutación del presupuesto:", error);
        },
    };

    const addMutation = useMutation({
        mutationFn: SavingService.addSaving,
        ...mutationOptions,
    });

    const deleteMutation = useMutation({
        mutationFn: SavingService.deleteSavingById,
        ...mutationOptions,
        onSuccess: (data) => {
            queryClient.invalidateQueries(["savings"]);
        },
    });

    const updateMutation = useMutation({
        mutationFn: (variables) => SavingService.updateSavingById(variables.id, variables.updates),
        ...mutationOptions,
    });

    return {
        addSaving: addMutation.mutateAsync,
        deleteSaving: deleteMutation.mutateAsync,
        updateSaving: updateMutation.mutateAsync,
        isAdding: addMutation.isPending,
        isDeleting: deleteMutation.isPending,
        isUpdating: updateMutation.isPending,
    };
}
