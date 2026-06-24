// Tipos ("kinds") del modelo unificado FinancialBucket.
// Cada presupuesto, ahorro, deuda o inversión es un "bucket" que se distingue
// por este discriminador.

export const KIND = {
  BUDGET: 'budget',
  SAVING: 'saving',
  DEBT: 'debt',
  INVESTMENT: 'investment',
};

export const KIND_LIST = Object.values(KIND);

// Clave única del store unificado en AsyncStorage.
export const BUCKETS_KEY = '@buckets';

// Claves legadas (se conservan tras la migración para permitir rollback).
export const LEGACY_KEYS = {
  [KIND.BUDGET]: '@budgets',
  [KIND.SAVING]: '@savings',
  [KIND.DEBT]: '@debts',
};

// Mapeo entre el `type` de una transacción y el `kind` del bucket al que apunta.
// (ingreso va a la "cuenta principal", sin bucket asociado.)
const TYPE_TO_KIND = {
  gasto: KIND.BUDGET,
  ahorro: KIND.SAVING,
};

export const kindFromTransactionType = (type) =>
  TYPE_TO_KIND[String(type || '').toLowerCase()] ?? null;
