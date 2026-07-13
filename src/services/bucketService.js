import * as Crypto from 'expo-crypto';

import { makeCollection } from './collection';

// Servicio unificado de "buckets" (presupuestos, ahorros, deudas, inversiones),
// sincronizado en la nube (AppSync + DynamoDB), por usuario.
const col = makeCollection('Bucket');

export const getAllBuckets = () => col.getAll();

export const getBucketsByKind = async (kind) => {
  const all = await col.getAll();
  return all.filter((b) => b.kind === kind);
};

export const saveAllBuckets = (buckets) => col.replaceAll(buckets);

export const addBucket = async (kind, data) => {
  const now = new Date().toISOString();
  return col.add({
    ...data,
    id: Crypto.randomUUID(),
    kind,
    total: parseFloat(data.total) || 0,
    used: Number(data.used) || 0,
    created_at: now,
    updated_at: now,
  });
};

export const deleteBucketById = (id) => col.remove(id);

export const updateBucketById = async (id, updates) => {
  const patch = { ...updates, updated_at: new Date().toISOString() };
  if (updates.total !== undefined) patch.total = parseFloat(updates.total) || 0;
  return col.update(id, patch);
};
