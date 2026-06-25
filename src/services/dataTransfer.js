import AsyncStorage from '@react-native-async-storage/async-storage';

// Importación de datos locales (respaldo en JSON) hacia AsyncStorage.
// Formato esperado: { buckets: [...], transactions: [...], categories: [...] }
// (cualquiera de las tres claves es opcional; se escribe lo que venga).

const FIELD_TO_KEY = {
  buckets: '@buckets',
  transactions: '@transactions',
  categories: '@categories',
};

/**
 * Carga datos desde un JSON (string u objeto) en AsyncStorage.
 * @param {string|object} raw
 * @returns {Promise<{imported: string[]}>}
 */
export const importData = async (raw) => {
  let data;
  try {
    data = typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch (e) {
    throw new Error('El archivo no es un JSON válido.');
  }

  if (!data || typeof data !== 'object') {
    throw new Error('El archivo no tiene el formato esperado.');
  }

  const writes = [];
  for (const [field, key] of Object.entries(FIELD_TO_KEY)) {
    if (Array.isArray(data[field])) {
      writes.push([key, JSON.stringify(data[field])]);
    }
  }

  if (writes.length === 0) {
    throw new Error('El archivo no contiene datos reconocibles (buckets, transactions o categories).');
  }

  await AsyncStorage.multiSet(writes);
  // Los datos importados ya están en el modelo unificado: evitamos que la
  // migración los reprocese.
  await AsyncStorage.setItem('@schema_version', '2');

  return { imported: writes.map(([key]) => key) };
};
