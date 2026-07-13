import AsyncStorage from '@react-native-async-storage/async-storage';

import { makeCloudCollection } from './cloudCollection';
import { makeLocalCollection } from './localCollection';
import { isLocalMode } from './storageMode';

// Todos los modelos que respalda el modo local, para subirlos al ascender de
// invitado a cuenta.
const LOCAL_MODELS = [
  'Transaction', 'Bucket', 'Account', 'Category', 'ReportConfig',
  'RecurringRule', 'Bill', 'CardPurchase', 'InvestmentMove',
];

// Ascenso de invitado a cuenta: sube los datos guardados en el dispositivo
// (@local/<Modelo>) a la cuenta recién autenticada. NO mezcla: si una colección
// ya tiene datos en la nube (cuenta existente), se respeta la nube y los datos
// locales quedan intactos en el dispositivo. Idempotente y no destructivo.
export const migrateGuestToCloud = async () => {
  for (const modelName of LOCAL_MODELS) {
    try {
      const local = await makeLocalCollection(modelName).getAll();
      if (!local.length) continue;
      const cloudCol = makeCloudCollection(modelName);
      const cloud = await cloudCol.getAll();
      if (cloud.length > 0) continue; // la nube manda: no duplicar ni pisar
      await Promise.all(local.map((o) => cloudCol.add(o).catch(() => {})));
    } catch {
      // colección problemática: seguimos con las demás
    }
  }
};

// Sube una sola vez los datos locales existentes (de antes de la nube) a la
// cuenta del usuario. Idempotente:
//  - se controla con un flag en AsyncStorage,
//  - y solo migra una colección si en la nube está vacía (para no duplicar).
const MIGRATED_KEY = '@cloud_migrated_v1';

const MAP = [
  ['@transactions', 'Transaction'],
  ['@buckets', 'Bucket'],
  ['@accounts', 'Account'],
  ['@categories', 'Category'],
  ['@reports', 'ReportConfig'],
];

export const migrateLocalToCloud = async () => {
  try {
    if (isLocalMode()) return; // sin cuenta: no hay nube a la que subir
    if (await AsyncStorage.getItem(MIGRATED_KEY)) return;

    for (const [key, modelName] of MAP) {
      const raw = await AsyncStorage.getItem(key);
      const local = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(local) || local.length === 0) continue;

      const col = makeCloudCollection(modelName);
      const cloud = await col.getAll();
      if (cloud.length > 0) continue; // ya hay datos en la nube: no duplicamos

      await Promise.all(local.map((o) => col.add(o).catch(() => {})));
    }

    await AsyncStorage.setItem(MIGRATED_KEY, '1');
  } catch (e) {
    // Sin red o error transitorio: se reintenta en el próximo arranque.
    console.warn('Migración a la nube pospuesta:', e?.message);
  }
};
