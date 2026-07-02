import { defineAuth } from '@aws-amplify/backend';

// Autenticación con Amazon Cognito.
// Fase 1: login por email/contraseña + verificación 2FA con app authenticator (TOTP), opcional.
// (OAuth Google/Apple queda para una fase posterior; SMS se evita para no depender de SNS.)
export const auth = defineAuth({
  loginWith: {
    email: true,
  },
  multifactor: {
    mode: 'OPTIONAL',
    totp: true,
  },
});
