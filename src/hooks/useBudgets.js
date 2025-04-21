    import {useState, useEffect, useCallback} from 'react';
    import * as budgetService from '../services/budgetService'; // Importa el servicio

    export const useBudgets = () => {
        const [budgets, setBudgets] = useState([]);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState(null); 

        const loadBudgets = useCallback(async() => {
            try {
                setLoading(true);
                setError(null);
                const data = await budgetService.getAllBudgets();
                setBudgets(data);
            } catch (error) {
                console.error('Error al cargar presupuestos:', error);
            } finally {
                setLoading(false);
            }
        }, []);

        useEffect(() => {
            loadBudgets();
        }
        , [loadBudgets]);

        const addBudget = async (budget) => {
            try {
                setError(null);
                const newBudget = await budgetService.addBudget(budget);
                setBudgets((prev) => [...prev, newBudget]);
                return newBudget;
            } catch (error) {
                console.error('HOOK: Error al añadir presupuesto:', error);
                setError(error);
                throw error;
            }
        };

        const updateBudget = async (id, updatedBudget) => {
            try {
                setError(null);
                const updatedBudgetData = await budgetService.updateBudgetById(id, updatedBudget);
                setBudgets((prev) =>
                    prev.map((budget) => (budget.id === id ? updatedBudgetData : budget))
                );
                return updatedBudgetData;
            } catch (error) {
                console.error('HOOK: Error al actualizar presupuesto:', error);
                setError(error);
                throw error;
            }
        }

        const deleteBudget = async (id) => {
            try {
                setError(null);
                await budgetService.deleteBudgetById(id);
                // Actualiza el estado local
                const filteredBudgets = budgets.filter((budget) => budget.id !== id);
                setBudgets(filteredBudgets);
            } catch (error) {
                console.error('Error al eliminar presupuesto:', error);
                throw error;
            }
        };


        return {
            budgets,
            loading,
            error,
            addBudget,
            deleteBudget,
            updateBudget,
            reload: loadBudgets,
        };
    }