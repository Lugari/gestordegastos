import { Platform, Alert } from 'react-native';

// Avisos multiplataforma. En web, Alert.alert de react-native-web es un no-op
// (y con botones nunca ejecuta los callbacks), así que usamos las APIs del navegador.

export const notify = (title, message) => {
  if (Platform.OS === 'web') window.alert(message ? `${title}\n\n${message}` : title);
  else Alert.alert(title, message);
};

// Confirmación con promesa: true si el usuario acepta.
export const confirmAsync = (title, message, confirmLabel = 'Aceptar') =>
  new Promise((resolve) => {
    if (Platform.OS === 'web') {
      resolve(window.confirm(`${title}\n\n${message}`));
    } else {
      Alert.alert(title, message, [
        { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
        { text: confirmLabel, style: 'destructive', onPress: () => resolve(true) },
      ]);
    }
  });
