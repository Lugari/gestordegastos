import AsyncStorage from "@react-native-async-storage/async-storage"; 
import * as Crypto from 'expo-crypto';

const SAVINGS_KEY = "@savings"; // Centralizamos la clave

/**
 * Obtiene todos los ahorros desde AsyncStorage.
 * @returns {Promise<Array>} Una promesa que resuelve a un array de ahorros.
 */

export const getAllSavings = async () => {
    try {
        const data = await AsyncStorage.getItem(SAVINGS_KEY);
        return data ? JSON.parse(data) : [];
    }
    catch (error) {
        console.error("Error al obtener ahorros:", error);
        //Manejar el error
        return [];
    }
}

/**
 * Guarda un array completo de ahorros en AsyncStorage.
 * @param {Array} savings - El array de ahorros a guardar.
 * @returns {Promise<void>}
 */

export const saveAllSavings = async (savings) => {
    try {
        await AsyncStorage.setItem(SAVINGS_KEY, JSON.stringify(savings));
    }
    catch (error) {
        console.error("Error al guardar ahorros:", error);
        throw error; // Lanza el error para que la operación que llamó sepa que falló
    }
}

/**
 * Añade un nuevo ahorro a la lista existente.
 * @param {object} savingData - Los datos del nuevo ahorro (sin id/timestamps).
 * @returns {Promise<object>} El nuevo ahorro añadido (con id y timestamps).
 */

export const addSaving= async (savingData) => {
    try {
        const currentSavings = await getAllSavings()
        const newSaving = {
            ...savingData,
            id: Crypto.randomUUID(), // Genera un ID único
            total: parseFloat(savingData.total) || 0, // Asegurar que el monto sea número
            showable: savingData.showable !== undefined ? savingData.showable : false, // Asegurar que showable sea booleano
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        }
        const updatedSavings = [...currentSavings, newSaving];
        await saveAllSavings(updatedSavings);
        return newSaving; // Devuelve el ahorro creado
    }
    catch (error) {
        console.error("Error al añadir ahorro:", error);
        throw error;
    }
}

/**
 * Elimina un ahorro por su ID.
 * @param {string} id - El ID del ahorro a eliminar.
 * @returns {Promise<void>}
 */
export const deleteSavingById = async (id) => {
    try {
        const currentSavings = await getAllSavings();
        const savings = currentSavings.filter(b=> b.id !== id);
        await saveAllSavings(savings);
    }
    catch (error) {
        console.error("Error al eliminar ahorro:", error);
        throw error;
    }
}

/**
 * Actualiza un ahorro por su ID.
 * @param {string} id - El ID del ahorro a actualizar.
 * @param {object} updates - Los datos a actualizar.
 * @returns {Promise<object>} El ahorro actualizado.
 */
export const updateSavingById = async (id, updates) => {
    try {
        const currentSavings = await getAllSavings(); 
        let savingWasFound = false;

        const updatedSavings = currentSavings.map( saving => {
            if (saving.id === id) {
                savingWasFound = true; 
                return {
                    ...saving,
                    ...updates,
                    total: updates.total !== undefined ? (parseFloat(updates.total) || 0) : saving.total,
                    updated_at: new Date().toISOString(), // Actualiza timestamp
                };
            }
            return saving;
        });

        if (!savingWasFound) {
            throw new Error(`ahorro con id ${id} no encontrado para actualizar.`);
        }

        await saveAllSavings(updatedSavings);

        const finalUpdatedSaving = updatedSavings.find(b => b.id === id);
        return finalUpdatedSaving;

    } catch (error) {
        console.error("Error al actualizar ahorro:", error);
        throw error;
    }
};