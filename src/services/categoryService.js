import * as Crypto from 'expo-crypto';

import { makeCollection } from './collection';

// Categorías de transacciones, sincronizadas en la nube (AppSync + DynamoDB).
const col = makeCollection('Category');

export const getAllCategories = () => col.getAll();

export const saveAllCategories = (categories) => col.replaceAll(categories);

export const AddCategory = (categoryData) => {
  const now = new Date().toISOString();
  return col.add({ ...categoryData, id: Crypto.randomUUID(), created_at: now, updated_at: now });
};

export const updateCategoryById = (id, updates) =>
  col.update(id, { ...updates, updated_at: new Date().toISOString() });

export const deleteCategoryById = (id) => col.remove(id);
