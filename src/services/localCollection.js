import * as Crypto from 'expo-crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Colección documental LOCAL para un modelo (Account, Transaction, …).
// Guarda un array de objetos de la app en AsyncStorage bajo `@local/<Modelo>`.
// Mantiene EXACTAMENTE la misma API que makeCloudCollection para que los
// servicios no distingan entre nube y local.
const keyFor = (modelName) => `@local/${modelName}`;

const readAll = async (modelName) => {
  try {
    const raw = await AsyncStorage.getItem(keyFor(modelName));
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
};

const writeAll = (modelName, arr) =>
  AsyncStorage.setItem(keyFor(modelName), JSON.stringify(arr || []));

export const makeLocalCollection = (modelName) => {
  const getAll = async () => readAll(modelName);

  const add = async (obj) => {
    const id = obj.id || Crypto.randomUUID();
    const record = { ...obj, id };
    const all = await readAll(modelName);
    // id explícito ya presente: se comporta como "no duplicar" (idempotente),
    // igual que la nube rechaza ids repetidos que usan los motores.
    if (all.some((o) => o.id === id)) throw new Error('Registro duplicado');
    all.push(record);
    await writeAll(modelName, all);
    return record;
  };

  const update = async (id, updates) => {
    const all = await readAll(modelName);
    const idx = all.findIndex((o) => o.id === id);
    const current = idx >= 0 ? all[idx] : {};
    const merged = { ...current, ...updates, id };
    if (idx >= 0) all[idx] = merged;
    else all.push(merged);
    await writeAll(modelName, all);
    return merged;
  };

  const remove = async (id) => {
    const all = await readAll(modelName);
    await writeAll(modelName, all.filter((o) => o.id !== id));
  };

  const replaceAll = async (objects) => {
    await writeAll(modelName, (objects || []).map((o) => ({ ...o, id: o.id || Crypto.randomUUID() })));
  };

  return { getAll, add, update, remove, replaceAll };
};
