import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';

// Definición del backend de EzMoniManager.
const backend = defineBackend({
  auth,
  data,
});

// Habilita el flujo USER_PASSWORD_AUTH además de SRP. Necesario para que el
// inicio de sesión funcione sin el módulo nativo de SRP de Amplify (que no
// existe en Expo Go), manteniendo SRP disponible para builds nativos y web.
const { cfnUserPoolClient } = backend.auth.resources.cfnResources;
cfnUserPoolClient.explicitAuthFlows = [
  'ALLOW_USER_PASSWORD_AUTH',
  'ALLOW_USER_SRP_AUTH',
  'ALLOW_REFRESH_TOKEN_AUTH',
];
