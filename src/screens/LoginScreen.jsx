import React, { useContext, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import { AuthContext } from '../context/AuthContext';
import * as authService from '../services/authService';
import { SIZES, FONTS } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { useIsDesktop } from '../hooks/useResponsive';


// Traduce los errores de Cognito a mensajes claros en español.
const traducirError = (e) => {
  switch (e?.name) {
    case 'UsernameExistsException':
      return 'Ese correo ya está registrado. Inicia sesión.';
    case 'NotAuthorizedException':
      return 'Correo o contraseña incorrectos.';
    case 'UserNotFoundException':
      return 'No existe una cuenta con ese correo.';
    case 'CodeMismatchException':
      return 'El código no es correcto.';
    case 'ExpiredCodeException':
      return 'El código expiró. Pide uno nuevo.';
    case 'InvalidPasswordException':
    case 'InvalidParameterException':
      return 'La contraseña no cumple los requisitos (mín. 8, mayúscula, minúscula, número y símbolo).';
    case 'LimitExceededException':
      return 'Demasiados intentos. Espera un momento e inténtalo de nuevo.';
    default:
      return e?.message || 'Ocurrió un error. Inténtalo de nuevo.';
  }
};

const TITULOS = {
  signIn: 'Iniciar sesión',
  signUp: 'Crear cuenta',
  confirm: 'Confirma tu correo',
  mfa: 'Verificación en dos pasos',
  forgot: 'Recuperar contraseña',
  reset: 'Nueva contraseña',
};

// Campo con icono. Definido a nivel de módulo (no dentro del render) para que
// React no lo recree en cada tecla y el input no pierda el foco.
const IconInput = ({ icon, t, styles, ...props }) => (
  <View style={styles.inputRow}>
    <MaterialIcons name={icon} size={20} color={t.neutral} />
    <TextInput style={styles.input} placeholderTextColor={t.neutral} {...props} />
  </View>
);

const LoginScreen = () => {
  const { theme } = useTheme();
  const styles = React.useMemo(() => makeStyles(theme), [theme]);
  const { refresh, continuarSinConexion } = useContext(AuthContext);
  const isDesktop = useIsDesktop();

  const [mode, setMode] = useState('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const goTo = (m, msg = '') => {
    setError('');
    setInfo(msg);
    setCode('');
    setMode(m);
  };

  // Interpreta el "siguiente paso" que devuelve Cognito tras iniciar sesión.
  const manejarPasoSesion = async (nextStep) => {
    const step = nextStep?.signInStep;
    if (step === 'DONE') {
      await refresh();
    } else if (step === 'CONFIRM_SIGN_IN_WITH_TOTP_CODE') {
      goTo('mfa', 'Ingresa el código de tu app de autenticación.');
    } else if (step === 'CONFIRM_SIGN_UP') {
      goTo('confirm', 'Tu correo aún no está confirmado. Te enviamos un código.');
    } else {
      setError(`Paso de inicio de sesión no soportado: ${step}`);
    }
  };

  const submit = async () => {
    setError('');
    setInfo('');
    setLoading(true);
    try {
      if (mode === 'signIn') {
        if (!email || !password) throw { message: 'Ingresa tu correo y contraseña.' };
        const res = await authService.iniciarSesion({ email: email.trim(), password });
        await manejarPasoSesion(res.nextStep);
      } else if (mode === 'signUp') {
        if (!email || !password) throw { message: 'Ingresa tu correo y una contraseña.' };
        const res = await authService.registrar({ email: email.trim(), password });
        if (res.nextStep?.signUpStep === 'CONFIRM_SIGN_UP') {
          goTo('confirm', 'Te enviamos un código de 6 dígitos a tu correo.');
        } else {
          await refresh();
        }
      } else if (mode === 'confirm') {
        await authService.confirmarRegistro({ email: email.trim(), code: code.trim() });
        // Confirmado: intentamos iniciar sesión automáticamente si tenemos la contraseña.
        if (password) {
          const res = await authService.iniciarSesion({ email: email.trim(), password });
          await manejarPasoSesion(res.nextStep);
        } else {
          goTo('signIn', 'Cuenta confirmada. Ahora inicia sesión.');
        }
      } else if (mode === 'mfa') {
        const res = await authService.responderReto(code.trim());
        await manejarPasoSesion(res.nextStep);
      } else if (mode === 'forgot') {
        if (!email) throw { message: 'Ingresa tu correo.' };
        await authService.recuperarPassword({ email: email.trim() });
        goTo('reset', 'Te enviamos un código para restablecer tu contraseña.');
      } else if (mode === 'reset') {
        await authService.confirmarNuevaPassword({ email: email.trim(), code: code.trim(), newPassword });
        goTo('signIn', 'Contraseña actualizada. Inicia sesión.');
      }
    } catch (e) {
      if (e?.name === 'UserNotConfirmedException') {
        try {
          await authService.reenviarCodigo({ email: email.trim() });
        } catch {}
        goTo('confirm', 'Tu correo aún no está confirmado. Te enviamos un código.');
      } else {
        setError(traducirError(e));
      }
    } finally {
      setLoading(false);
    }
  };

  const reenviar = async () => {
    setError('');
    try {
      await authService.reenviarCodigo({ email: email.trim() });
      setInfo('Código reenviado.');
    } catch (e) {
      setError(traducirError(e));
    }
  };

  // --- Campos reutilizables ---
  const emailField = (
    <IconInput t={theme} styles={styles}
      icon="mail-outline"
      placeholder="Correo"
      value={email}
      onChangeText={setEmail}
      keyboardType="email-address"
      autoCapitalize="none"
      autoCorrect={false}
      editable={!loading}
    />
  );

  const passwordField = (
    <View style={styles.inputRow}>
      <MaterialIcons name="lock-outline" size={20} color={theme.neutral} />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        placeholderTextColor={theme.neutral}
        value={password}
        onChangeText={setPassword}
        secureTextEntry={!showPass}
        autoCapitalize="none"
        editable={!loading}
      />
      <TouchableOpacity onPress={() => setShowPass((v) => !v)} accessibilityLabel={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
        <MaterialIcons name={showPass ? 'visibility-off' : 'visibility'} size={20} color={theme.neutral} />
      </TouchableOpacity>
    </View>
  );

  const codeField = (
    <IconInput t={theme} styles={styles}
      icon="pin"
      placeholder="Código de 6 dígitos"
      value={code}
      onChangeText={setCode}
      keyboardType="number-pad"
      editable={!loading}
    />
  );

  // --- Cuerpo según el modo ---
  const renderBody = () => {
    switch (mode) {
      case 'signUp':
        return (
          <>
            {emailField}
            {passwordField}
            <Text style={styles.hint}>Mínimo 8 caracteres, con mayúscula, minúscula, número y símbolo.</Text>
            {primaryBtn('Crear cuenta')}
            {linkRow('¿Ya tienes cuenta?', 'Inicia sesión', () => goTo('signIn'))}
          </>
        );
      case 'confirm':
        return (
          <>
            {codeField}
            {primaryBtn('Confirmar')}
            {linkRow('¿No llegó?', 'Reenviar código', reenviar)}
          </>
        );
      case 'mfa':
        return (
          <>
            {codeField}
            {primaryBtn('Verificar')}
            {linkRow('', 'Cancelar', () => goTo('signIn'))}
          </>
        );
      case 'forgot':
        return (
          <>
            {emailField}
            {primaryBtn('Enviar código')}
            {linkRow('', 'Volver', () => goTo('signIn'))}
          </>
        );
      case 'reset':
        return (
          <>
            {codeField}
            <View style={styles.inputRow}>
              <MaterialIcons name="lock-outline" size={20} color={theme.neutral} />
              <TextInput
                style={styles.input}
                placeholder="Nueva contraseña"
                placeholderTextColor={theme.neutral}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showPass}
                autoCapitalize="none"
                editable={!loading}
              />
              <TouchableOpacity onPress={() => setShowPass((v) => !v)}>
                <MaterialIcons name={showPass ? 'visibility-off' : 'visibility'} size={20} color={theme.neutral} />
              </TouchableOpacity>
            </View>
            {primaryBtn('Cambiar contraseña')}
            {linkRow('', 'Volver', () => goTo('signIn'))}
          </>
        );
      default: // signIn
        return (
          <>
            {emailField}
            {passwordField}
            <TouchableOpacity onPress={() => goTo('forgot')} style={styles.forgotWrap}>
              <Text style={styles.link}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>
            {primaryBtn('Iniciar sesión')}
            {linkRow('¿No tienes cuenta?', 'Crear una', () => goTo('signUp'))}
            {offlineOption}
          </>
        );
    }
  };

  // Entrar sin cuenta (modo local). Disponible siempre que se pueda: si el
  // servidor está caído o la red bloquea el login, igual puedes usar la app.
  const offlineOption = (
    <View style={styles.offlineWrap}>
      <View style={styles.divider}><View style={styles.dividerLine} /><Text style={styles.dividerText}>o</Text><View style={styles.dividerLine} /></View>
      <TouchableOpacity style={styles.offlineBtn} onPress={continuarSinConexion} disabled={loading}>
        <MaterialIcons name="cloud-off" size={18} color={theme.green} />
        <Text style={styles.offlineText}>Continuar sin cuenta</Text>
      </TouchableOpacity>
      <Text style={styles.offlineHint}>Úsala sin conexión; tus datos se guardan en este dispositivo.</Text>
    </View>
  );

  const primaryBtn = (label) => (
    <TouchableOpacity style={[styles.loginBtn, loading && { opacity: 0.6 }]} onPress={submit} disabled={loading}>
      {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginText}>{label}</Text>}
    </TouchableOpacity>
  );

  const linkRow = (prefix, action, onPress) => (
    <View style={styles.linkRow}>
      {prefix ? <Text style={styles.linkMuted}>{prefix} </Text> : null}
      <TouchableOpacity onPress={onPress} disabled={loading}>
        <Text style={styles.link}>{action}</Text>
      </TouchableOpacity>
    </View>
  );

  const messages = (
    <>
      {info ? <Text style={styles.info}>{info}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </>
  );

  const body = (
    <>
      {messages}
      {renderBody()}
    </>
  );

  // --- Escritorio ---
  if (isDesktop) {
    return (
      <View style={styles.desktopRoot}>
        <View style={styles.brandPanel}>
          <Text style={styles.brandTitle}>Gestor de Gastos</Text>
          <Text style={styles.brandSubtitle}>
            Controla tus finanzas, presupuestos y metas de ahorro en un solo lugar.
          </Text>
        </View>
        <View style={styles.formPanel}>
          <View style={styles.card}>
            <Text style={styles.cardHeading}>{TITULOS[mode]}</Text>
            {body}
          </View>
        </View>
      </View>
    );
  }

  // --- Móvil ---
  return (
    <View style={styles.container}>
      <View style={styles.brandMobile}>
        <View style={styles.logo}>
          <MaterialIcons name="account-balance-wallet" size={34} color="#fff" />
        </View>
        <Text style={styles.brandTitleM}>Gestor de Gastos</Text>
        <Text style={styles.brandSubM}>{TITULOS[mode]}</Text>
      </View>
      {body}
    </View>
  );
};

const makeStyles = (t) => StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: SIZES.padding * 2, backgroundColor: t.background },

  brandMobile: { alignItems: 'center', gap: 4, marginBottom: 28 },
  logo: { width: 64, height: 64, borderRadius: 18, backgroundColor: t.green, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  brandTitleM: { fontSize: SIZES.font * 1.6, fontWeight: '600', color: t.textPrimary },
  brandSubM: { fontSize: SIZES.font, color: t.textSecondary, textAlign: 'center', maxWidth: 280 },

  inputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#d6d6cc', borderRadius: 12, paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10, marginBottom: 10,
  },
  input: { flex: 1, fontSize: SIZES.font, color: t.textPrimary, outlineStyle: 'none' },
  hint: { fontSize: SIZES.font * 0.82, color: t.textSecondary, marginBottom: 6, marginTop: -2 },

  loginBtn: { backgroundColor: t.green, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 8, minHeight: 50, justifyContent: 'center' },
  loginText: { color: '#fff', fontSize: SIZES.font * 1.1, fontWeight: '700' },

  forgotWrap: { alignSelf: 'flex-end', marginBottom: 4 },
  linkRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 16 },
  linkMuted: { fontSize: SIZES.font * 0.9, color: t.textSecondary },
  link: { fontSize: SIZES.font * 0.9, color: t.green, fontWeight: '700' },

  info: { fontSize: SIZES.font * 0.9, color: t.green, marginBottom: 10, textAlign: 'center' },
  error: { fontSize: SIZES.font * 0.9, color: t.expense, marginBottom: 10, textAlign: 'center' },

  // Continuar sin cuenta
  offlineWrap: { marginTop: 22, alignItems: 'center' },
  divider: { flexDirection: 'row', alignItems: 'center', alignSelf: 'stretch', gap: 10, marginBottom: 14 },
  dividerLine: { flex: 1, height: 1, backgroundColor: t.border },
  dividerText: { fontSize: SIZES.font * 0.85, color: t.neutral },
  offlineBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, alignSelf: 'stretch', borderWidth: 1, borderColor: t.green, borderRadius: 12, paddingVertical: 13 },
  offlineText: { color: t.green, fontSize: SIZES.font, fontWeight: '700' },
  offlineHint: { fontSize: SIZES.font * 0.78, color: t.textSecondary, textAlign: 'center', marginTop: 8 },

  // --- Escritorio ---
  desktopRoot: { flex: 1, flexDirection: 'row', backgroundColor: t.background },
  brandPanel: { flex: 1, backgroundColor: t.green, justifyContent: 'center', paddingHorizontal: SIZES.padding * 4 },
  brandTitle: { fontFamily: FONTS.heading.fontFamily, fontSize: SIZES.font * 3.4, fontWeight: '700', color: '#fff', marginBottom: SIZES.padding },
  brandSubtitle: { fontFamily: FONTS.body.fontFamily, fontSize: SIZES.font * 1.4, color: 'rgba(255,255,255,0.85)', maxWidth: 420, lineHeight: SIZES.font * 2 },
  formPanel: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SIZES.padding * 2 },
  card: {
    width: '100%', maxWidth: 420, backgroundColor: '#fff', borderRadius: SIZES.radius * 1.6, padding: SIZES.padding * 2.5,
    shadowColor: '#000', shadowOpacity: 0.12, shadowOffset: { width: 0, height: 8 }, shadowRadius: 24, elevation: 6,
  },
  cardHeading: { fontSize: SIZES.font * 1.6, fontWeight: '600', color: t.textPrimary, marginBottom: SIZES.padding * 1.2 },
});

export default LoginScreen;
