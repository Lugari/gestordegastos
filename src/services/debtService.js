import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from 'expo-crypto';

const DEBTS_KEY = "@debts";

export const getAllDebts = async () => {
    try {
        const data = await AsyncStorage.getItem(DEBTS_KEY);
        return data ? JSON.parse(data) : [];
    }
    catch (error) {
        console.error("Error getting debts:", error);
        return [];
    }
}

export const saveAllDebts = async (debts) => {
    try {
        await AsyncStorage.setItem(DEBTS_KEY, JSON.stringify(debts));
    }
    catch (error) {
        console.error("Error saving debts:", error);
        throw error;
    }
}

export const addDebt = async (debtData) => {
    try {
        const currentDebts = await getAllDebts();
        const newDebt = {
            ...debtData,
            id: Crypto.randomUUID(),
            total: parseFloat(debtData.total) || 0,
            apr: parseFloat(debtData.apr) || 0,
            fees: parseInt(debtData.fees) || 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        }
        const updatedDebts = [...currentDebts, newDebt];
        await saveAllDebts(updatedDebts);
        return newDebt;
    }
    catch (error) {
        console.error("Error adding debt:", error);
        throw error;
    }
}

export const deleteDebtById = async (id) => {
    try {
        const currentDebts = await getAllDebts();
        const debts = currentDebts.filter(d => d.id !== id);
        await saveAllDebts(debts);
    }
    catch (error) {
        console.error("Error deleting debt:", error);
        throw error;
    }
}

export const updateDebtById = async (id, updates) => {
    try {
        const currentDebts = await getAllDebts();
        let debtWasFound = false;

        const updatedDebts = currentDebts.map(debt => {
            if (debt.id === id) {
                debtWasFound = true;
                return {
                    ...debt,
                    ...updates,
                    total: updates.total !== undefined ? (parseFloat(updates.total) || 0) : debt.total,
                    apr: updates.apr !== undefined ? (parseFloat(updates.apr) || 0) : debt.apr,
                    fees: updates.fees !== undefined ? (parseInt(updates.fees) || 0) : debt.fees,
                    updated_at: new Date().toISOString(),
                };
            }
            return debt;
        });

        if (!debtWasFound) {
            throw new Error(`Debt with id ${id} not found to update.`);
        }

        await saveAllDebts(updatedDebts);

        const finalUpdatedDebt = updatedDebts.find(d => d.id === id);
        return finalUpdatedDebt;

    } catch (error) {
        console.error("Error updating debt:", error);
        throw error;
    }
};