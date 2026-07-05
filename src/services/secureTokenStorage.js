import * as SecureStore from 'expo-secure-store';

// Almacén de tokens de Cognito respaldado por el Keychain (iOS) / Keystore (Android).
//
// Diseño defensivo (el Keystore de Android puede colgarse con acceso concurrente):
//  1. Todas las operaciones nativas pasan por UNA cola serializada (sin concurrencia).
//  2. Caché en memoria write-through: las lecturas repetidas no tocan el Keystore.
//  3. Timeout por operación: si el módulo nativo se cuelga, resolvemos con null en
//     lugar de bloquear la autenticación para siempre.
//  4. Troceo: cada valor de SecureStore tiene un límite (~2048 bytes) y los JWT lo superan.
//  5. Claves saneadas: SecureStore solo admite [A-Za-z0-9._-].
const CHUNK_SIZE = 2000;
const OP_TIMEOUT_MS = 4000;

const safeKey = (key) => 'amp_' + String(key).replace(/[^A-Za-z0-9._-]/g, '_');

const withTimeout = (promise, fallback) =>
  Promise.race([
    promise,
    new Promise((resolve) => setTimeout(() => resolve(fallback), OP_TIMEOUT_MS)),
  ]);

// Cola: encadena las operaciones para que nunca haya dos llamadas nativas en vuelo.
let queue = Promise.resolve();
const enqueue = (fn) => {
  const run = queue.then(fn, fn);
  // La cola nunca se rompe: los errores se propagan al llamador, no a la cadena.
  queue = run.catch(() => {});
  return run;
};

const nativeGet = (k) => withTimeout(SecureStore.getItemAsync(k), null);
const nativeSet = (k, v) => withTimeout(SecureStore.setItemAsync(k, v), undefined);
const nativeDel = (k) => withTimeout(SecureStore.deleteItemAsync(k), undefined);

export class SecureTokenStorage {
  constructor() {
    this.cache = new Map();
  }

  async setItem(key, value) {
    const str = String(value);
    this.cache.set(key, str);
    return enqueue(async () => {
      const k = safeKey(key);
      const chunks = Math.max(1, Math.ceil(str.length / CHUNK_SIZE));
      await nativeSet(`${k}__n`, String(chunks));
      for (let i = 0; i < chunks; i++) {
        await nativeSet(`${k}__${i}`, str.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE));
      }
    });
  }

  async getItem(key) {
    if (this.cache.has(key)) return this.cache.get(key);
    return enqueue(async () => {
      if (this.cache.has(key)) return this.cache.get(key);
      const k = safeKey(key);
      const meta = await nativeGet(`${k}__n`);
      if (meta == null) {
        this.cache.set(key, null);
        return null;
      }
      const chunks = parseInt(meta, 10) || 0;
      let out = '';
      for (let i = 0; i < chunks; i++) {
        const part = await nativeGet(`${k}__${i}`);
        if (part == null) {
          this.cache.set(key, null);
          return null;
        }
        out += part;
      }
      this.cache.set(key, out);
      return out;
    });
  }

  async removeItem(key) {
    this.cache.set(key, null);
    return enqueue(async () => {
      const k = safeKey(key);
      const meta = await nativeGet(`${k}__n`);
      const chunks = meta ? parseInt(meta, 10) || 0 : 0;
      for (let i = 0; i < chunks; i++) {
        await nativeDel(`${k}__${i}`);
      }
      await nativeDel(`${k}__n`);
    });
  }

  // Amplify llama removeItem por cada clave conocida al cerrar sesión.
  async clear() {
    this.cache.clear();
  }
}
