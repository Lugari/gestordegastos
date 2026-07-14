import AsyncStorage from '@react-native-async-storage/async-storage';
import { deleteUser } from 'aws-amplify/auth';

import { makeCloudCollection } from './cloudCollection';
import { makeLocalCollection } from './localCollection';

// Borrado de cuenta (requisito de Google Play: la app debe permitir eliminar
// la cuenta y sus datos desde dentro). Orden importante:
//   1) purgar los datos del usuario en la nube (aún autenticado),
//   2) eliminar el usuario de Cognito,
//   3) limpiar rastros locales.
// La autorización por dueño garantiza que getAll/remove solo tocan SUS filas.
const MODELS = [
  'Transaction', 'Bucket', 'Account', 'Category', 'ReportConfig',
  'RecurringRule', 'Bill', 'CardPurchase', 'InvestmentMove', 'DeviceToken',
];

// Claves locales de la app que dejan de tener sentido sin la cuenta.
const LOCAL_KEYS = ['@username', '@cloud_migrated_v1'];

const clearLocalKeys = async (keys) => {
  await Promise.all(keys.map((k) => AsyncStorage.removeItem(k).catch(() => {})));
};

// Borra todas las filas del usuario en la nube. Devuelve cuántas eliminó.
export const purgeCloudData = async () => {
  let total = 0;
  for (const modelName of MODELS) {
    try {
      const col = makeCloudCollection(modelName);
      const rows = await col.getAll();
      await Promise.all(rows.map((r) => col.remove(r.id).catch(() => {})));
      total += rows.length;
    } catch {
      // un modelo fallido no debe frenar el resto de la purga
    }
  }
  return total;
};

// Elimina la cuenta completa: datos en la nube + usuario de Cognito + caché local.
export const deleteAccountAndData = async () => {
  await purgeCloudData();
  await deleteUser(); // invalida la sesión; el estado lo limpia AuthContext
  await clearLocalKeys(LOCAL_KEYS);
};

// Modo invitado: borra todos los datos guardados en el dispositivo.
export const purgeLocalData = async () => {
  for (const modelName of MODELS) {
    try {
      await makeLocalCollection(modelName).replaceAll([]);
    } catch {}
  }
  await clearLocalKeys(LOCAL_KEYS);
};
