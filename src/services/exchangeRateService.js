import AsyncStorage from '@react-native-async-storage/async-storage';

// Tasas de cambio relativas a USD (1 USD = rate[code]). Conversión:
//   monto_to = monto_from * rate[to] / rate[from]
//
// Fuente: open.er-api.com (gratuita, sin API key). Se cachea en AsyncStorage y
// hay una tabla de respaldo para funcionar sin conexión.

const RATES_KEY = '@rates';
const API_URL = 'https://open.er-api.com/v6/latest/USD';

// Respaldo aproximado (se usa solo si no hay caché ni red).
export const FALLBACK_RATES = {
  USD: 1,
  COP: 4000,
  EUR: 0.92,
  MXN: 18,
  ARS: 950,
  GBP: 0.79,
};

export const getCachedRates = async () => {
  try {
    const raw = await AsyncStorage.getItem(RATES_KEY);
    return raw ? JSON.parse(raw) : null; // { rates, updatedAt }
  } catch (e) {
    return null;
  }
};

const saveRates = async (rates) => {
  const payload = { rates, updatedAt: Date.now() };
  await AsyncStorage.setItem(RATES_KEY, JSON.stringify(payload));
  return payload;
};

/**
 * Descarga las tasas más recientes y las cachea.
 * @returns {Promise<{rates: object, updatedAt: number}>}
 */
export const fetchRates = async () => {
  const res = await fetch(API_URL);
  const json = await res.json();
  if (json.result !== 'success' || !json.rates) {
    throw new Error('No se pudieron obtener las tasas de cambio.');
  }
  return saveRates(json.rates);
};

/**
 * Devuelve las tasas a usar: caché si existe, si no el respaldo.
 */
export const loadInitialRates = async () => {
  const cached = await getCachedRates();
  if (cached?.rates) return cached;
  return { rates: FALLBACK_RATES, updatedAt: null };
};
