import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@transactions';

// Función para generar un ID único simple
const generateUniqueId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const useTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsedData = JSON.parse(data);
        setTransactions(parsedData);
      }
    } catch (error) {
      console.error('Error al cargar transacciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveTransactions = async (newTransactions) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newTransactions));
      setTransactions(newTransactions);
    } catch (error) {
      console.error('Error al guardar transacciones:', error);
    }
  };

  const addTransaction = async (transaction) => {
    try {
      const newTransaction = {
        ...transaction,
        id: generateUniqueId(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      const updatedTransactions = [...transactions, newTransaction];
      await saveTransactions(updatedTransactions);
      return newTransaction;
    } catch (error) {
      console.error('Error al añadir transacción:', error);
      throw error;
    }
  };

  const deleteTransaction = async (id) => {
    try {
      const filteredTransactions = transactions.filter(t => t.id !== id);
      await saveTransactions(filteredTransactions);
    } catch (error) {
      console.error('Error al eliminar transacción:', error);
      throw error;
    }
  };

  const updateTransaction = async (id, updates) => {
    try {
      const updatedTransactions = transactions.map(t =>
        t.id === id 
          ? { ...t, ...updates, updated_at: new Date().toISOString() }
          : t
      );
      await saveTransactions(updatedTransactions);
    } catch (error) {
      console.error('Error al actualizar transacción:', error);
      throw error;
    }
  };

  const markAsSynced = async (id) => {
    await updateTransaction(id, { synced: true });
  };

  return {
    transactions,
    loading,
    addTransaction,
    deleteTransaction,
    updateTransaction,
    markAsSynced,
    reload: loadTransactions,
  };
};
