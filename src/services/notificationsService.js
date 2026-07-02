import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

// Notificaciones locales (sin backend): alertas de presupuesto y recordatorios.
// En web es no-op (no hay soporte nativo); en móvil funciona con permiso del usuario.
const isNative = Platform.OS !== 'web';
const ENABLED_KEY = '@notifications_enabled';
const MAP_KEY = '@notif_schedule_map'; // { [key]: notificationId } para poder cancelar

// Muestra la alerta aunque la app esté en primer plano.
if (isNative) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export const notificationsEnabled = async () => (await AsyncStorage.getItem(ENABLED_KEY)) === '1';

// Pide permiso y guarda el estado. Devuelve true si quedaron activadas.
export const enableNotifications = async () => {
  if (!isNative) return false;
  const { status } = await Notifications.requestPermissionsAsync();
  const ok = status === 'granted';
  await AsyncStorage.setItem(ENABLED_KEY, ok ? '1' : '0');
  return ok;
};

export const disableNotifications = async () => {
  await AsyncStorage.setItem(ENABLED_KEY, '0');
  if (isNative) {
    try { await Notifications.cancelAllScheduledNotificationsAsync(); } catch {}
  }
};

// Notificación inmediata (p. ej. alerta de presupuesto superado).
export const notifyNow = async (title, body) => {
  if (!isNative || !(await notificationsEnabled())) return;
  try {
    await Notifications.scheduleNotificationAsync({ content: { title, body }, trigger: null });
  } catch {}
};

const loadMap = async () => {
  const raw = await AsyncStorage.getItem(MAP_KEY);
  return raw ? JSON.parse(raw) : {};
};
const saveMap = (m) => AsyncStorage.setItem(MAP_KEY, JSON.stringify(m));

// Programa (o reprograma) un recordatorio identificado por `key`, para una fecha futura.
export const scheduleReminder = async (key, title, body, date) => {
  if (!isNative) return;
  await cancelReminder(key);
  if (!(await notificationsEnabled())) return;
  if (!(date instanceof Date) || isNaN(date.getTime()) || date.getTime() <= Date.now()) return;
  try {
    const id = await Notifications.scheduleNotificationAsync({ content: { title, body }, trigger: date });
    const m = await loadMap();
    m[key] = id;
    await saveMap(m);
  } catch {}
};

export const cancelReminder = async (key) => {
  if (!isNative) return;
  const m = await loadMap();
  if (m[key]) {
    try { await Notifications.cancelScheduledNotificationAsync(m[key]); } catch {}
    delete m[key];
    await saveMap(m);
  }
};

// Próxima ocurrencia (a las 9:00) del día del mes de `isoDate`; útil para la
// fecha de facturación recurrente de tarjetas de crédito.
export const nextMonthlyOccurrence = (isoDate) => {
  const d = new Date(isoDate);
  if (isNaN(d.getTime())) return null;
  const day = d.getDate();
  const now = new Date();
  let next = new Date(now.getFullYear(), now.getMonth(), day, 9, 0, 0);
  if (next.getTime() <= now.getTime()) {
    next = new Date(now.getFullYear(), now.getMonth() + 1, day, 9, 0, 0);
  }
  return next;
};
