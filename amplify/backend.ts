import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';

// Definición del backend de EzMoniManager.
// Fase 0: solo auth + data (esquema). OAuth/MFA, Lambda de negocio,
// Streams de DynamoDB y Pinpoint se añaden en fases posteriores.
defineBackend({
  auth,
  data,
});
