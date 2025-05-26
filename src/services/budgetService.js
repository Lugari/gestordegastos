import AsyncStorage from "@react-native-async-storage/async-storage"; 
import * as Crypto from 'expo-crypto';

const BUDGETS_KEY = "@budgets"; // Centralizamos la clave

/**
 * Obtiene todos los presupuestos desde AsyncStorage.
 * @returns {Promise<Array>} Una promesa que resuelve a un array de presupuestos.
 */

export const getAllBudgets = async () => {
    try {
        const data = await AsyncStorage.getItem(BUDGETS_KEY);
        return data ? JSON.parse(data) : [];
    }
    catch (error) {
        console.error("Error al obtener presupuestos:", error);
        //Manejar el error
        return [];
    }
}

/**
 * Guarda un array completo de presupuestos en AsyncStorage.
 * @param {Array} budgets - El array de presupuestos a guardar.
 * @returns {Promise<void>}
 */

export const saveAllBudgets = async (budgets) => {
    try {
        await AsyncStorage.setItem(BUDGETS_KEY, JSON.stringify(budgets));
    }
    catch (error) {
        console.error("Error al guardar presupuestos:", error);
        throw error; // Lanza el error para que la operación que llamó sepa que falló
    }
}

/**
 * Añade un nuevo presupuesto a la lista existente.
 * @param {object} budgetData - Los datos del nuevo presupuesto (sin id/timestamps).
 * @returns {Promise<object>} El nuevo presupuesto añadido (con id y timestamps).
 */

export const addBudget = async (budgetData) => {
    try {
        const currentBudgets = await getAllBudgets()
        const newBudget = {
            ...budgetData,
            id: Crypto.randomUUID(), // Genera un ID único
            total: parseFloat(budgetData.total) || 0, // Asegurar que el monto sea número
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        }
        const updatedBudgets = [...currentBudgets, newBudget];
        await saveAllBudgets(updatedBudgets);
        return newBudget; // Devuelve el presupuesto creado
    }
    catch (error) {
        console.error("Error al añadir presupuesto:", error);
        throw error;
    }
}

/**
 * Elimina un presupuesto por su ID.
 * @param {string} id - El ID del presupuesto a eliminar.
 * @returns {Promise<void>}
 */
export const deleteBudgetById = async (id) => {
    try {
        const currentBudgets = await getAllBudgets();
        const budgets = currentBudgets.filter(b=> b.id !== id);
        await saveAllBudgets(budgets);
    }
    catch (error) {
        console.error("Error al eliminar presupuesto:", error);
        throw error;
    }
}

/**
 * Actualiza un presupuesto por su ID.
 * @param {string} id - El ID del presupuesto a actualizar.
 * @param {object} updates - Los datos a actualizar.
 * @returns {Promise<object>} El presupuesto actualizado.
 */
export const updateBudgetById = async (id, updates) => {
    try {
        const currentBudgets = await getAllBudgets(); 
        let budgetWasFound = false;

        const updatedBudgets = currentBudgets.map( budget => {
            if (budget.id === id) {
                budgetWasFound = true; 
                return {
                    ...budget,
                    ...updates,
                    total: updates.total !== undefined ? (parseFloat(updates.total) || 0) : budget.total,
                    updated_at: new Date().toISOString(), // Actualiza timestamp
                };
            }
            return budget;
        });

        if (!budgetWasFound) {
            throw new Error(`Presupuesto con id ${id} no encontrado para actualizar.`);
        }

        await saveAllBudgets(updatedBudgets);

        const finalUpdatedBudget = updatedBudgets.find(b => b.id === id);
        return finalUpdatedBudget;

    } catch (error) {
        console.error("Error al actualizar presupuesto:", error);
        throw error;
    }
};