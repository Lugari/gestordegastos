import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

import { BUCKETS_KEY } from '../constants/bucketKinds';

// Servicio unificado de "buckets" (presupuestos, ahorros, deudas, inversiones).
// Reemplaza progresivamente a budgetService / savingService / debtService.

/**
 * Devuelve todos los buckets almacenados.
 * @returns {Promise<Array>}
 */
export const getAllBuckets = async () => {
  try {
    const data = await AsyncStorage.getItem(BUCKETS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error al obtener buckets:', error);
    return [];
  }
};

/**
 * Devuelve los buckets de un tipo concreto.
 * @param {string} kind
 * @returns {Promise<Array>}
 */
export const getBucketsByKind = async (kind) => {
  const all = await getAllBuckets();
  return all.filter((b) => b.kind === kind);
};

export const saveAllBuckets = async (buckets) => {
  try {
    await AsyncStorage.setItem(BUCKETS_KEY, JSON.stringify(buckets));
  } catch (error) {
    console.error('Error al guardar buckets:', error);
    throw error;
  }
};

/**
 * Añade un bucket de un tipo dado.
 * @param {string} kind
 * @param {object} data - datos del formulario (sin id/timestamps/kind)
 * @returns {Promise<object>} el bucket creado
 */
export const addBucket = async (kind, data) => {
  try {
    const current = await getAllBuckets();
    const newBucket = {
      ...data,
      id: Crypto.randomUUID(),
      kind,
      total: parseFloat(data.total) || 0,
      used: Number(data.used) || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    await saveAllBuckets([...current, newBucket]);
    return newBucket;
  } catch (error) {
    console.error('Error al añadir bucket:', error);
    throw error;
  }
};

export const deleteBucketById = async (id) => {
  try {
    const current = await getAllBuckets();
    await saveAllBuckets(current.filter((b) => b.id !== id));
  } catch (error) {
    console.error('Error al eliminar bucket:', error);
    throw error;
  }
};

export const updateBucketById = async (id, updates) => {
  try {
    const current = await getAllBuckets();
    let found = false;

    const next = current.map((bucket) => {
      if (bucket.id === id) {
        found = true;
        return {
          ...bucket,
          ...updates,
          total: updates.total !== undefined ? parseFloat(updates.total) || 0 : bucket.total,
          updated_at: new Date().toISOString(),
        };
      }
      return bucket;
    });

    if (!found) {
      throw new Error(`Bucket con id ${id} no encontrado para actualizar.`);
    }

    await saveAllBuckets(next);
    return next.find((b) => b.id === id);
  } catch (error) {
    console.error('Error al actualizar bucket:', error);
    throw error;
  }
};
