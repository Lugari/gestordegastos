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
  signIn({ username: email, password });

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
