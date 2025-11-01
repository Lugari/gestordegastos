import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import * as CategoryService from '../services/categoryService';

export const useGetCategories = ()  => {
    return useQuery({
        queryKey: ["categories"],
        queryFn: CategoryService.getAllCategories
    })
}

export const useManageCategories = () => {
    
    const queryClient = useQueryClient();

    const mutationOptions = {
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey:['categories']});
            queryClient.invalidateQueries({queryKey:['transactions']});
        },
        onError: (error) => {
            console.error("Error en la mutación de la categoría: ", error);
        },
    };

    const addMutation = useMutation ({
        mutationFn: CategoryService.AddCategory,
        ...mutationOptions,
    });

    const deleteMutation = useMutation ({
        mutationFn: CategoryService.deleteCategoryById,
        ...mutationOptions,
    });

    const updateMutation = useMutation ({
        mutationFn: CategoryService.updateCategoryById,
        ...mutationOptions,
    });

    return {
        addCategory: addMutation.mutateAsync,
        deleteCategory: deleteMutation.mutateAsync,
        updateCategory: updateMutation.mutateAsync,
        isAdding: addMutation.isPending,
        isDeleting: deleteMutation.isPending,
        isUpdating: updateMutation.isPending,
    }
}