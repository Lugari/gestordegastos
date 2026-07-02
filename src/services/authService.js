import { Platform } from 'react-native';
import {
  signUp,
  confirmSignUp,
  resendSignUpCode,
  signIn,
  confirmSignIn,
  signOut,
  getCurrentUser,
  fetchAuthSession,
  resetPassword,
  confirmResetPassword,
  setUpTOTP,
  verifyTOTPSetup,
  updateMFAPreference,
} from 'aws-amplify/auth';

// En móvil usamos USER_PASSWORD_AUTH: evita el módulo nativo de SRP (ausente en
// Expo Go). En web dejamos el flujo por defecto (SRP), que funciona en el navegador.
const signInOptions = Platform.OS === 'web' ? undefined : { authFlowType: 'USER_PASSWORD_AUTH' };

// Capa fina sobre Amazon Cognito (aws-amplify/auth). Cada función devuelve
// el resultado de Amplify, cuyo `nextStep` indica qué sigue en el flujo.

// --- Registro ---
export const registrar = ({ email, password }) =>
  signUp({
    username: email,
    password,
    options: { userAttributes: { email } },
  });

export const confirmarRegistro = ({ email, code }) =>
  confirmSignUp({ username: email, confirmationCode: code });

export const reenviarCodigo = ({ email }) =>
  resendSignUpCode({ username: email });

// --- Inicio de sesión ---
export const iniciarSesion = ({ email, password }) =>
  signIn({ username: email, password, options: signInOptions });

// Responde a un reto (código 2FA, nueva contraseña obligatoria, etc.).
export const responderReto = (challengeResponse) =>
  confirmSignIn({ challengeResponse });

export const cerrarSesion = () => signOut();

// --- Sesión actual ---
export const usuarioActual = () => getCurrentUser();
export const sesionActual = () => fetchAuthSession();

// --- Recuperar contraseña ---
export const recuperarPassword = ({ email }) =>
  resetPassword({ username: email });

export const confirmarNuevaPassword = ({ email, code, newPassword }) =>
  confirmResetPassword({ username: email, confirmationCode: code, newPassword });

// --- 2FA (TOTP con app authenticator) ---
export const iniciarTOTP = () => setUpTOTP();
export const verificarTOTP = (code) => verifyTOTPSetup({ code });
export const activarTOTPComoPreferido = () =>
  updateMFAPreference({ totp: 'PREFERRED' });
