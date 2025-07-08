import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as TransactionService from '../services/transactionService'; 
import * as SavingService from '../services/savingService'; 
import * as BudgetService from '../services/budgetService';

export const useGetTransactions = () => {
  return useQuery({
    queryKey: ['transactions'], 
    queryFn: TransactionService.getAllTransactions,
  });
  // devuelve { data, isLoading, isError, error, refetch, ... }
};

export const useManageTransactions = () => {
  const queryClient = useQueryClient(); // Obtiene el cliente para invalidar caché

  const mutationOptions = {
    onSuccess: () => {
      // invalida la query para que React Query la vuelva a cargar automáticamente
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['savings'] });
    },
    onError: (error) => {
      // Puedes manejar errores globalmente aquí si quieres (ej. mostrar notificación)
      console.error("Error en la mutación de transacción:", error);
    },
  };

  // Mutación para AÑADIR
  const addMutation = useMutation({
    mutationFn: async (transactionData) => {
      
      const newTransaction = await TransactionService.addTransaction(transactionData)

      if (transactionData.type.toLowerCase() === 'gasto' && transactionData.budget_id) {
        const budgets = queryClient.getQueryData(['budgets'])
        const budget = budgets.find(b => b.id === transactionData.budget_id);
        if (budget) {
          const newUsedAmount = (budget.used || 0) + transactionData.amount
          await BudgetService.updateBudgetById(transactionData.budget_id, { used: newUsedAmount }); 
        }
      }else if (transactionData.type.toLowerCase() === 'ahorro' && transactionData.budget_id) {
        const savings = queryClient.getQueryData(['savings'])
        const saving = savings.find(s => s.id === transactionData.budget_id)
        if (saving){
          const newUsedAmount = (saving.used || 0) + transactionData.amount
          await SavingService.updateSavingById(transactionData.budget_id, { used: newUsedAmount})
        }
      }
      return newTransaction
    },
    ...mutationOptions
  });

  // Mutación para BORRAR
  const deleteMutation = useMutation({
    mutationFn: async ({transactionId, budgetId, amount, type}) => {
      if(type === 'gasto' && budgetId){         // Si es un gasto lo descuenta del monto total usado del presupuesto
        const budgets = queryClient.getQueryData(['budgets'])
        const budget = budgets.find(b => b.id === budgetId)
        if (budget) {
          const newUsedAmount = Math.max(0, (budget.used || 0) - amount)
          await BudgetService.updateBudgetById(budgetId, { used: newUsedAmount})
        }
      }else if(type === 'ahorro' && budgetId){ //Si es un ahorro lo descuenta del monto toal ahorrado
        const savings = queryClient.getQueryData(['budgets'])
        const saving = savings.find(b => b.id === budgetId)
        if (saving) {
          const newUsedAmount = Math.max(0, (saving.used || 0) - amount)
          await SavingService.updateSavingById(budgetId, { used: newUsedAmount})
        }
      }
      await TransactionService.deleteTransactionById(transactionId) // elimina la transacción
    },
    ...mutationOptions,
  })

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