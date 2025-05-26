import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as TransactionService from '../services/transactionService'; // Importa tu servicio

export const useGetTransactions = () => {
  return useQuery({
    queryKey: ['transactions'], 
    queryFn: TransactionService.getAllTransactions,
  });
  // Esto devuelve { data, isLoading, isError, error, refetch, ... }
};

export const useManageTransactions = () => {
  const queryClient = useQueryClient(); // Obtiene el cliente para invalidar caché

  const mutationOptions = {
    onSuccess: () => {
      // Cuando una mutación tiene éxito, invalida la query 'transactions'
      // Esto hará que React Query la vuelva a cargar automáticamente
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
    onError: (error) => {
      // Puedes manejar errores globalmente aquí si quieres (ej. mostrar notificación)
      console.error("Error en la mutación de transacción:", error);
    },
  };

  // Mutación para AÑADIR
  const addMutation = useMutation({
    mutationFn: TransactionService.addTransaction, // Llama a la función del servicio
    ...mutationOptions,
  });

  // Mutación para BORRAR
  const deleteMutation = useMutation({
    mutationFn: TransactionService.deleteTransactionById, // Llama a la función del servicio
    ...mutationOptions,
    // Podrías querer hacer algo específico al borrar, como actualizar dependencias
     onSuccess: (data, variables, context) => {
         queryClient.invalidateQueries(['transactions']);
         queryClient.invalidateQueries(['budgets']);
     }
  });

  // Mutación para ACTUALIZAR
  const updateMutation = useMutation({
    // mutationFn espera un objeto { id, updates }
    mutationFn: (variables) => TransactionService.updateTransactionById(variables.id, variables.updates),
    ...mutationOptions,
  });

  return {
    addTransaction: addMutation.mutateAsync, // Usamos mutateAsync para poder usar await si es necesario
    deleteTransaction: deleteMutation.mutateAsync,
    updateTransaction: updateMutation.mutateAsync,
    isAdding: addMutation.isPending, // Puedes usar estos estados en la UI
    isDeleting: deleteMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
};