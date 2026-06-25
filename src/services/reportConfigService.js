import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

// Persistencia de configuraciones de reporte guardadas, para re-ejecutarlas.
const REPORTS_KEY = '@reports';

export const getAllReports = async () => {
  try {
    const data = await AsyncStorage.getItem(REPORTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Error al obtener reportes guardados:', e);
    return [];
  }
};

export const saveReport = async (name, config) => {
  const current = await getAllReports();
  const item = {
    id: Crypto.randomUUID(),
    name: name.trim(),
    config,
    created_at: new Date().toISOString(),
  };
  await AsyncStorage.setItem(REPORTS_KEY, JSON.stringify([...current, item]));
  return item;
};

export const deleteReportById = async (id) => {
  const current = await getAllReports();
  await AsyncStorage.setItem(REPORTS_KEY, JSON.stringify(current.filter((r) => r.id !== id)));
};
