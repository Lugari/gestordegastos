import AsyncStorage from '@react-native-async-storage/async-storage';

// Modo de almacenamiento de la app:
//   'cloud' → datos en AppSync/DynamoDB (requiere sesión de Cognito)
//   'local' → datos solo en el dispositivo (AsyncStorage), sin cuenta
//
// El modo se resuelve en el arranque (AuthContext) y lo consultan las
// colecciones en CADA llamada, de modo que cambiar de modo (p. ej. al ascender
// de invitado a cuenta) no requiere recargar la app.
const MODE_KEY = '@storage_mode';

let currentMode = 'cloud'; // por defecto hasta que AuthContext lo resuelva

export const getStorageMode = () => currentMode;
export const isLocalMode = () => currentMode === 'local';

// Fija el modo en memoria y lo persiste (para recordar "sin cuenta" entre
// arranques). Pasar persist=false para cambios efímeros.
export const setStorageMode = async (mode, persist = true) => {
  currentMode = mode === 'local' ? 'local' : 'cloud';
  if (persist) {
    try {
      await AsyncStorage.setItem(MODE_KEY, currentMode);
    } catch {
      // si falla el guardado, el modo en memoria sigue siendo válido esta sesión
    }
  }
};

// Lee el modo persistido (al arrancar). Devuelve 'cloud' | 'local'.
export const loadStorageMode = async () => {
  try {
    const v = await AsyncStorage.getItem(MODE_KEY);
    currentMode = v === 'local' ? 'local' : 'cloud';
  } catch {
    currentMode = 'cloud';
  }
  return currentMode;
};
