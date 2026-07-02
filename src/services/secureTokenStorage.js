import * as SecureStore from 'expo-secure-store';

// Almacén de tokens de Cognito respaldado por el Keychain (iOS) / Keystore (Android).
// Reemplaza al almacenamiento en claro de AsyncStorage.
//
// Dos detalles importantes de expo-secure-store:
//  1. Cada valor no puede pasar de ~2048 bytes → troceamos los tokens largos (JWT).
//  2. Las claves solo admiten [A-Za-z0-9._-] → saneamos la clave de Amplify.
const CHUNK_SIZE = 2000;

const safeKey = (key) => 'amp_' + String(key).replace(/[^A-Za-z0-9._-]/g, '_');

export class SecureTokenStorage {
  // Guarda un valor, partiéndolo en trozos si es necesario.
  async setItem(key, value) {
    const k = safeKey(key);
    const str = String(value);
    const chunks = Math.max(1, Math.ceil(str.length / CHUNK_SIZE));
    await SecureStore.setItemAsync(`${k}__n`, String(chunks));
    for (let i = 0; i < chunks; i++) {
      await SecureStore.setItemAsync(`${k}__${i}`, str.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE));
    }
  }

  // Reensambla los trozos en el valor original.
  async getItem(key) {
    const k = safeKey(key);
    const meta = await SecureStore.getItemAsync(`${k}__n`);
    if (meta == null) return null;
    const chunks = parseInt(meta, 10) || 0;
    let out = '';
    for (let i = 0; i < chunks; i++) {
      const part = await SecureStore.getItemAsync(`${k}__${i}`);
      if (part == null) return null;
      out += part;
    }
    return out;
  }

  // Borra todos los trozos de una clave.
  async removeItem(key) {
    const k = safeKey(key);
    const meta = await SecureStore.getItemAsync(`${k}__n`);
    const chunks = meta ? parseInt(meta, 10) || 0 : 0;
    for (let i = 0; i < chunks; i++) {
      await SecureStore.deleteItemAsync(`${k}__${i}`);
    }
    await SecureStore.deleteItemAsync(`${k}__n`);
  }

  // Amplify llama removeItem por cada clave conocida al cerrar sesión,
  // por lo que un clear() explícito no es necesario (SecureStore no enumera claves).
  async clear() {}
}
