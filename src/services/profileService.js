import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchUserAttributes, updateUserAttributes } from 'aws-amplify/auth';

// Nombre para mostrar del usuario. Fuente de verdad: el atributo `name` de
// Cognito (sincroniza entre dispositivos). AsyncStorage es solo una caché local
// para pintar al instante sin esperar a la red.
const NAME_KEY = '@username';
export const DEFAULT_NAME = 'Usuario';

// Lee la caché local de inmediato (rápido, offline).
export const getCachedName = async () => (await AsyncStorage.getItem(NAME_KEY)) || DEFAULT_NAME;

// Lee de la nube y refresca la caché. Devuelve null si no hay nombre en la nube
// (para no pisar la caché local con el valor por defecto).
export const fetchCloudName = async () => {
  try {
    const attrs = await fetchUserAttributes();
    const name = (attrs?.name || '').trim();
    if (name) {
      await AsyncStorage.setItem(NAME_KEY, name);
      return name;
    }
  } catch {
    // sin sesión / offline: nos quedamos con la caché
  }
  return null;
};

// Guarda en la nube y en la caché.
export const saveName = async (value) => {
  const name = (value || '').trim() || DEFAULT_NAME;
  await AsyncStorage.setItem(NAME_KEY, name);
  try {
    await updateUserAttributes({ userAttributes: { name } });
  } catch {
    // offline: quedó en caché y se puede reintentar luego
  }
  return name;
};
