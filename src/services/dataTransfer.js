import { makeCloudCollection } from './cloudCollection';

// Importación de un respaldo JSON hacia la nube del usuario.
// Formato esperado: { buckets: [...], transactions: [...], categories: [...] }
// (cualquiera de las tres claves es opcional; se escribe lo que venga).
const FIELD_TO_MODEL = {
  buckets: 'Bucket',
  transactions: 'Transaction',
  categories: 'Category',
};

/**
 * Carga datos desde un JSON (string u objeto) reemplazando la colección en la nube.
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

  const imported = [];
  for (const [field, modelName] of Object.entries(FIELD_TO_MODEL)) {
    if (Array.isArray(data[field])) {
      await makeCloudCollection(modelName).replaceAll(data[field]);
      imported.push(field);
    }
  }

  if (imported.length === 0) {
    throw new Error('El archivo no contiene datos reconocibles (buckets, transactions o categories).');
  }

  return { imported };
};
