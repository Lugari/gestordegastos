import { useState, useEffect, useCallback } from 'react';
import * as TransactionService from '../services/transactionService'; // Importa el servicio

export const useTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Añadimos estado para errores

  const loadTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null); // Resetea error al cargar
      const data = await TransactionService.getAllTransactions();
      setTransactions(data);
    } catch (err) {
      console.error('Hook: Error cargando transacciones', err);
      setError(err); // Guarda el error en el estado
    } finally {
      setLoading(false);
    }
  }, []); // useCallback para evitar re-creación innecesaria

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]); // Ejecuta al montar y si loadTransactions cambia (no debería)

  const addTransaction = async (transactionData) => {
    try {
      setError(null);
      const newTransaction = await TransactionService.addTransaction(transactionData);
      setTransactions(prev => [...prev, newTransaction]);
      return newTransaction; // Opcional: devolver la nueva transacción
    } catch (err) {
      console.error('Hook: Error añadiendo transacción', err);
      setError(err);
      throw err; // Re-lanza para que el componente que llama sepa del error si es necesario
    }
  };

  const deleteTransaction = async (id) => {
    try {
      setError(null);
      await TransactionService.deleteTransactionById(id);
      // Actualiza el estado local
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error('Hook: Error eliminando transacción', err);
      setError(err);
      throw err;
    }
  };

  const updateTransaction = async (id, updates) => {
     try {
       setError(null);
       const updatedTx = await TransactionService.updateTransactionById(id, updates);
       // Actualiza el estado local
       setTransactions(prev => prev.map(t => (t.id === id ? updatedTx : t)));
       return updatedTx; // Opcional
     } catch (err) {
       console.error('Hook: Error actualizando transacción', err);
       setError(err);
       throw err;
     }
   };

  return {
    transactions,
    loading,
    error, // Expone el estado de error
    addTransaction,
    deleteTransaction,
    updateTransaction,
    reload: loadTransactions, // Ahora 'reload' llama a la función interna del hook
  };
};