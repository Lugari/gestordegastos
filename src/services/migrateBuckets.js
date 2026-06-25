import AsyncStorage from '@react-native-async-storage/async-storage';

import { KIND, BUCKETS_KEY, LEGACY_KEYS, kindFromTransactionType } from '../constants/bucketKinds';

// Migración de datos al modelo unificado FinancialBucket.
//
// - Idempotente: se controla con la versión de esquema en AsyncStorage.
// - No destructiva: lee las claves legadas y escribe `@buckets`, pero NO borra
//   las claves viejas (permite rollback). Su purga se hará en una fase posterior.

const SCHEMA_KEY = '@schema_version';
const TRANSACTIONS_KEY = '@transactions';
export const TARGET_SCHEMA_VERSION = 2;

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

// v0 -> v1: unifica los datos legados en `@buckets` y enriquece las transacciones.
const unifyIntoBuckets = async () => {
  // Si ya existe `@buckets` con datos, no lo sobreescribimos.
  const existingBuckets = await readJson(BUCKETS_KEY, []);
  if (existingBuckets.length > 0) {
    return { reason: 'buckets-already-present' };
  }

  const [budgets, savings, debts] = await Promise.all([
    readJson(LEGACY_KEYS[KIND.BUDGET], []),
    readJson(LEGACY_KEYS[KIND.SAVING], []),
    readJson(LEGACY_KEYS[KIND.DEBT], []),
  ]);

  // Los ids existentes son UUID, no colisionan entre stores.
  const buckets = [
    ...budgets.map((b) => toBucket(b, KIND.BUDGET)),
    ...savings.map((s) => toBucket(s, KIND.SAVING)),
    ...debts.map((d) => toBucket(d, KIND.DEBT)),
  ];
  await AsyncStorage.setItem(BUCKETS_KEY, JSON.stringify(buckets));

  // Enriquecer transacciones con el vínculo unificado (target_id + target_kind),
  // conservando budget_id/type por compatibilidad.
  const transactions = await readJson(TRANSACTIONS_KEY, []);
  const migratedTx = transactions.map((t) =>
    t.target_kind !== undefined
      ? t
      : { ...t, target_id: t.budget_id ?? null, target_kind: kindFromTransactionType(t.type) });
  if (transactions.length > 0) {
    await AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(migratedTx));
  }

  return { counts: { buckets: buckets.length, transactions: transactions.length } };
};

// v1 -> v2: purga las claves legadas, ya migradas a `@buckets`.
const purgeLegacyKeys = async () => {
  await AsyncStorage.multiRemove([
    LEGACY_KEYS[KIND.BUDGET],
    LEGACY_KEYS[KIND.SAVING],
    LEGACY_KEYS[KIND.DEBT],
  ]);
};

/**
 * Ejecuta la migración por pasos hasta la versión objetivo. Idempotente y segura
 * para llamar en cada arranque.
 * @returns {Promise<{migrated: boolean, steps: string[]}>}
 */
export const migrateLegacyData = async () => {
  let version = await getSchemaVersion();
  if (version >= TARGET_SCHEMA_VERSION) {
    return { migrated: false, steps: [] };
  }

  const steps = [];

  if (version < 1) {
    await unifyIntoBuckets();
    steps.push('unify');
    await AsyncStorage.setItem(SCHEMA_KEY, '1');
    version = 1;
  }

  if (version < 2) {
    await purgeLegacyKeys();
    steps.push('purge-legacy');
    await AsyncStorage.setItem(SCHEMA_KEY, '2');
    version = 2;
  }

  console.log('Migración completada:', steps);
  return { migrated: true, steps };
};
