import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

// Cuentas del usuario (efectivo, banco, tarjeta…). Cada cuenta tiene su moneda;
// las transacciones se asocian a una cuenta y heredan su moneda.
const ACCOUNTS_KEY = '@accounts';

export const getAllAccounts = async () => {
  try {
    const data = await AsyncStorage.getItem(ACCOUNTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Error al obtener cuentas:', e);
    return [];
  }
};

const saveAll = async (accounts) => {
  await AsyncStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
};

export const addAccount = async (data) => {
  const current = await getAllAccounts();
  const account = {
    ...data,
    id: Crypto.randomUUID(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  await saveAll([...current, account]);
  return account;
};

export const deleteAccountById = async (id) => {
  const current = await getAllAccounts();
  await saveAll(current.filter((a) => a.id !== id));
};

export const updateAccountById = async (id, updates) => {
  const current = await getAllAccounts();
  const next = current.map((a) =>
    a.id === id ? { ...a, ...updates, updated_at: new Date().toISOString() } : a,
  );
  await saveAll(next);
  return next.find((a) => a.id === id);
};
