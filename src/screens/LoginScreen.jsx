import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, Alert } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import { AuthContext } from '../context/AuthContext';
import { SIZES, COLORS, FONTS } from '../constants/theme';
import { useIsDesktop } from '../hooks/useResponsive';

const GREEN = '#1C6B52';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const { login } = useContext(AuthContext);
  const isDesktop = useIsDesktop();

  const handleLogin = () => {
    if (!email || !password) {
      const msg = 'Ingresa tu correo y contraseña.';
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Faltan datos', msg);
      return;
    }
    // En una app real validarías las credenciales contra un servidor.
    login(email);
  };

  const fields = (
    <>
      <View style={styles.inputRow}>
        <MaterialIcons name="mail-outline" size={20} color="#8a8a80" />
        <TextInput
          style={styles.input}
          placeholder="Correo"
          placeholderTextColor="#b9b9af"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputRow}>
        <MaterialIcons name="lock-outline" size={20} color="#8a8a80" />
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          placeholderTextColor="#b9b9af"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPass}
        />
        <TouchableOpacity onPress={() => setShowPass((v) => !v)} accessibilityLabel={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
          <MaterialIcons name={showPass ? 'visibility-off' : 'visibility'} size={20} color="#8a8a80" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
        <Text style={styles.loginText}>Iniciar sesión</Text>
      </TouchableOpacity>

      <Text style={styles.terms}>Al continuar aceptas los términos de uso</Text>
    </>
  );

  // --- Escritorio: panel de marca + tarjeta de formulario ---
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
            <Text style={styles.cardHeading}>Iniciar sesión</Text>
            {fields}
          </View>
        </View>
      </View>
    );
  }

  // --- Móvil: marca + formulario ---
  return (
    <View style={styles.container}>
      <View style={styles.brandMobile}>
        <View style={styles.logo}>
          <MaterialIcons name="account-balance-wallet" size={34} color="#fff" />
        </View>
        <Text style={styles.brandTitleM}>Gestor de Gastos</Text>
        <Text style={styles.brandSubM}>Tus finanzas, presupuestos y metas en un solo lugar.</Text>
      </View>
      {fields}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: SIZES.padding * 2,
    backgroundColor: COLORS.background,
  },

  brandMobile: { alignItems: 'center', gap: 4, marginBottom: 28 },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: GREEN,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  brandTitleM: { fontSize: SIZES.font * 1.6, fontWeight: '600', color: COLORS.textPrimary },
  brandSubM: { fontSize: SIZES.font, color: COLORS.textSecondary, textAlign: 'center', maxWidth: 280 },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d6d6cc',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    marginBottom: 10,
  },
  input: { flex: 1, fontSize: SIZES.font, color: COLORS.textPrimary },

  loginBtn: {
    backgroundColor: GREEN,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  loginText: { color: '#fff', fontSize: SIZES.font * 1.1, fontWeight: '700' },
  terms: { textAlign: 'center', fontSize: SIZES.font * 0.85, color: '#a0a096', marginTop: 14 },

  // --- Escritorio ---
  desktopRoot: { flex: 1, flexDirection: 'row', backgroundColor: COLORS.background },
  brandPanel: {
    flex: 1,
    backgroundColor: GREEN,
    justifyContent: 'center',
    paddingHorizontal: SIZES.padding * 4,
  },
  brandTitle: {
    fontFamily: FONTS.heading.fontFamily,
    fontSize: SIZES.font * 3.4,
    fontWeight: '700',
    color: '#fff',
    marginBottom: SIZES.padding,
  },
  brandSubtitle: {
    fontFamily: FONTS.body.fontFamily,
    fontSize: SIZES.font * 1.4,
    color: 'rgba(255,255,255,0.85)',
    maxWidth: 420,
    lineHeight: SIZES.font * 2,
  },
  formPanel: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SIZES.padding * 2 },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#fff',
    borderRadius: SIZES.radius * 1.6,
    padding: SIZES.padding * 2.5,
    shadowColor: COLORS.textPrimary,
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
    elevation: 6,
  },
  cardHeading: { fontSize: SIZES.font * 1.6, fontWeight: '600', color: COLORS.textPrimary, marginBottom: SIZES.padding * 1.2 },
});

export default LoginScreen;
