import * as Crypto from 'expo-crypto';

import { makeCloudCollection } from './cloudCollection';

// Cuentas del usuario (efectivo, banco, tarjeta…), sincronizadas en la nube.
// Cada cuenta tiene su moneda; las transacciones se asocian a una cuenta.
const col = makeCloudCollection('Account');

export const getAllAccounts = () => col.getAll();

export const addAccount = (data) => {
  const now = new Date().toISOString();
  return col.add({ ...data, id: Crypto.randomUUID(), created_at: now, updated_at: now });
};

export const deleteAccountById = (id) => col.remove(id);

export const updateAccountById = (id, updates) =>
  col.update(id, { ...updates, updated_at: new Date().toISOString() });
