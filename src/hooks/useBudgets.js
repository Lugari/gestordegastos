import {useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@budgets';

// Función para generar un ID único simple
const generateUniqueId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const useBudgets = () => {
    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        loadBudgets();
    }, []);
    
    const loadBudgets = async () => {
        try {
        setLoading(true);
        const data = await AsyncStorage.getItem(STORAGE_KEY);
        if (data) {
            const parsedData = JSON.parse(data);
            setBudgets(parsedData);
        }
        } catch (error) {
        console.error('Error al cargar presupuestos:', error);
        } finally {
        setLoading(false);
        }
    };

    const saveBudgets = async (newBudgets) => {
        try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newBudgets));
        setBudgets(newBudgets);
        } catch (error) {
        console.error('Error al guardar presupuestos:', error);
        }
    };

    const addBudget = async (budget) => {
        try {
        const newBudget = {
            ...budget,
            id: generateUniqueId(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        
        const updatedBudgets = [...budgets, newBudget];
        await saveBudgets(updatedBudgets);
        return newBudget;
        } catch (error) {
        console.error('Error al añadir presupuesto:', error);
        throw error;
        }
    };

    const updateBudget = async (id, updatedBudget) => {
        try {
        const budgetIndex = budgets.findIndex((budget) => budget.id === id);
        if (budgetIndex === -1) {
            throw new Error('Presupuesto no encontrado');
        }
        
        const newBudgets = [...budgets];
        newBudgets[budgetIndex] = {
            ...newBudgets[budgetIndex],
            ...updatedBudget,
            updated_at: new Date().toISOString(),
        };
        
        await saveBudgets(newBudgets);
        return newBudgets[budgetIndex];
        } catch (error) {
        console.error('Error al actualizar presupuesto:', error);
        throw error;
        }
    };

    const deleteBudget = async (id) => {
        try {
        const filteredBudgets = budgets.filter((budget) => budget.id !== id);
        await saveBudgets(filteredBudgets);
        } catch (error) {
        console.error('Error al eliminar presupuesto:', error);
        throw error;
        }
    };

    const markAsSynced = async (id) => {
        await updateBudget(id, { synced: true });
    };

    return {
        budgets,
        loading,
        addBudget,
        deleteBudget,
        updateBudget,
        markAsSynced,
        reload: loadBudgets,
    };
}