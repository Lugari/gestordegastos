import { makeCloudCollection } from './cloudCollection';

// Transacciones sincronizadas en la nube (AppSync + DynamoDB), por usuario.
const col = makeCloudCollection('Transaction');

export const getAllTransactions = () => col.getAll();

export const addTransaction = async (transactionData) => {
  const now = new Date().toISOString();
  return col.add({
    ...transactionData,
    amount: parseFloat(transactionData.amount) || 0,
    created_at: now,
    updated_at: now,
  });
};

export const deleteTransactionById = (id) => col.remove(id);

export const updateTransactionById = async (id, updates) => {
  const patch = { ...updates, updated_at: new Date().toISOString() };
  if (updates.amount !== undefined) patch.amount = parseFloat(updates.amount) || 0;
  return col.update(id, patch);
};
