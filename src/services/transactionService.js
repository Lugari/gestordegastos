import AsyncStorage from '@react-native-async-storage/async-storage';

const TRANSACTIONS_KEY = '@transactions'; // Centralizamos la clave

const generateUniqueId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Obtiene todas las transacciones desde AsyncStorage.
 * @returns {Promise<Array>} Una promesa que resuelve a un array de transacciones.
 */
export const getAllTransactions = async () => {
  try {
    const data = await AsyncStorage.getItem(TRANSACTIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error al obtener transacciones:', error);
    // Podrías lanzar el error para manejarlo en el hook, o retornar un array vacío/valor por defecto
    // throw error;
    return [];
  }
};

/**
 * Guarda un array completo de transacciones en AsyncStorage.
 * @param {Array} transactions - El array de transacciones a guardar.
 * @returns {Promise<void>}
 */
const saveAllTransactions = async (transactions) => {
  try {
    await AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
  } catch (error) {
    console.error('Error al guardar transacciones:', error);
    throw error; // Lanza el error para que la operación que llamó sepa que falló
  }
};

/**
 * Añade una nueva transacción a la lista existente.
 * @param {object} transactionData - Los datos de la nueva transacción (sin id/timestamps).
 * @returns {Promise<object>} La nueva transacción añadida (con id y timestamps).
 */
export const addTransaction = async (transactionData) => {
  try {
    const currentTransactions = await getAllTransactions();
    const newTransaction = {
      ...transactionData,
      id: generateUniqueId(), // El servicio se encarga de generar el ID
      amount: parseFloat(transactionData.amount) || 0, // Asegurar que el monto sea número
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const updatedTransactions = [...currentTransactions, newTransaction];
    await saveAllTransactions(updatedTransactions);
    return newTransaction; // Devuelve la transacción creada
  } catch (error) {
    console.error('Error al añadir transacción:', error);
    throw error;
  }
};

/**
 * Elimina una transacción por su ID.
 * @param {string} id - El ID de la transacción a eliminar.
 * @returns {Promise<void>}
 */
export const deleteTransactionById = async (id) => {
  try {
    const currentTransactions = await getAllTransactions();
    const filteredTransactions = currentTransactions.filter(t => t.id !== id);
    await saveAllTransactions(filteredTransactions);
  } catch (error) {
    console.error('Error al eliminar transacción:', error);
    throw error;
  }
};

/**
 * Actualiza una transacción existente.
 * @param {string} id - El ID de la transacción a actualizar.
 * @param {object} updates - Un objeto con los campos a actualizar.
 * @returns {Promise<object>} La transacción actualizada.
 */
export const updateTransactionById = async (id, updates) => {
  try {
        const currentTransactions = await getAllTransactions();
        let updatedTransaction = null;
        const updatedTransactions = currentTransactions.map(t => {
        if (t.id === id) {
            updatedTransaction = {
            ...t,
            ...updates,
            amount: updates.amount !== undefined ? (parseFloat(updates.amount) || 0) : t.amount, // Actualiza monto si viene
            updated_at: new Date().toISOString(), // El servicio actualiza el timestamp
            };
            return updatedTransaction;
        }
        return t;
        });

        if (!updatedTransaction) {
        throw new Error(`Transacción con id ${id} no encontrada para actualizar.`);
        }

        await saveAllTransactions(updatedTransactions);
        return updatedTransaction;
    }
    catch (error) {
        console.error('Error al actualizar transacción:', error);
        throw error;
    }
};

