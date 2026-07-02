import { Platform } from 'react-native';
import { Amplify } from 'aws-amplify';
import { cognitoUserPoolsTokenProvider } from 'aws-amplify/auth/cognito';

import outputs from '../amplify_outputs.json';
import { SecureTokenStorage } from './services/secureTokenStorage';

// Conecta la app al backend desplegado (Cognito + AppSync).
Amplify.configure(outputs);

// En móvil, los tokens de sesión se guardan cifrados en el Keychain/Keystore.
// En web, Amplify usa el almacenamiento del navegador por defecto.
if (Platform.OS !== 'web') {
  cognitoUserPoolsTokenProvider.setKeyValueStorage(new SecureTokenStorage());
}
