import AsyncStorage from '@react-native-async-storage/async-storage';

import { KIND, BUCKETS_KEY, LEGACY_KEYS, kindFromTransactionType } from '../constants/bucketKinds';

// Migración de datos al modelo unificado FinancialBucket.
//
// - Idempotente: se controla con la versión de esquema en AsyncStorage.
// - No destructiva: lee las claves legadas y escribe `@buckets`, pero NO borra
//   las claves viejas (permite rollback). Su purga se hará en una fase posterior.

const SCHEMA_KEY = '@schema_version';
const TRANSACTIONS_KEY = '@transactions';
export const TARGET_SCHEMA_VERSION = 1;

const readJson = async (key, fallback) => {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.warn(`Migración: no se pudo leer ${key}`, e);
    return fallback;
  }
};

const getSchemaVersion = async () => {
  const raw = await AsyncStorage.getItem(SCHEMA_KEY);
  return parseInt(raw || '0', 10) || 0;
};

// Convierte un registro legado en un bucket, conservando todos sus campos
// y asegurando `kind` y `used`.
const toBucket = (record, kind) => ({
  ...record,
  kind,
  used: Number(record.used) || 0,
});

/**
 * Ejecuta la migración si hace falta. Segura para llamar en cada arranque.
 * @returns {Promise<{migrated: boolean, reason?: string, counts?: object}>}
 */
export const migrateLegacyData = async () => {
  const version = await getSchemaVersion();
  if (version >= TARGET_SCHEMA_VERSION) {
    return { migrated: false, reason: 'up-to-date' };
  }

  // Si ya existe `@buckets` con datos, no lo sobreescribimos: solo subimos versión.
  const existingBuckets = await readJson(BUCKETS_KEY, []);
  if (existingBuckets.length > 0) {
    await AsyncStorage.setItem(SCHEMA_KEY, String(TARGET_SCHEMA_VERSION));
    return { migrated: false, reason: 'buckets-already-present' };
  }

  // 1) Leer datos legados.
  const [budgets, savings, debts] = await Promise.all([
    readJson(LEGACY_KEYS[KIND.BUDGET], []),
    readJson(LEGACY_KEYS[KIND.SAVING], []),
    readJson(LEGACY_KEYS[KIND.DEBT], []),
  ]);

  // 2) Unificar en `@buckets` (los ids existentes son UUID, no colisionan).
  const buckets = [
    ...budgets.map((b) => toBucket(b, KIND.BUDGET)),
    ...savings.map((s) => toBucket(s, KIND.SAVING)),
    ...debts.map((d) => toBucket(d, KIND.DEBT)),
  ];
  await AsyncStorage.setItem(BUCKETS_KEY, JSON.stringify(buckets));

  // 3) Enriquecer transacciones con el vínculo unificado (target_id + target_kind),
  //    conservando budget_id/type para compatibilidad.
  const transactions = await readJson(TRANSACTIONS_KEY, []);
  let txTouched = 0;
  const migratedTx = transactions.map((t) => {
    if (t.target_kind !== undefined) return t; // ya migrada
    txTouched += 1;
    return {
      ...t,
      target_id: t.budget_id ?? null,
      target_kind: kindFromTransactionType(t.type),
    };
  });
  if (transactions.length > 0) {
    await AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(migratedTx));
  }

  // 4) Marcar versión.
  await AsyncStorage.setItem(SCHEMA_KEY, String(TARGET_SCHEMA_VERSION));

  const counts = {
    budgets: budgets.length,
    savings: savings.length,
    debts: debts.length,
    buckets: buckets.length,
    transactions: txTouched,
  };
  console.log('Migración a @buckets completada:', counts);
  return { migrated: true, counts };
};
