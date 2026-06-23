import React, { useState, useContext } from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { SIZES, COLORS, FONTS } from '../constants/theme';
import PrimaryButton from '../components/PrimaryButton';
import { useIsDesktop } from '../hooks/useResponsive';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const isDesktop = useIsDesktop();

  const handleLogin = () => {
    if (email === '' || password === '') {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }
    // In a real app, you'd validate the credentials against a server
    login(email);
  };

  const form = (
    <>
      <Text style={styles.title}>Iniciar sesión</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <PrimaryButton title="Login" onPress={handleLogin} />
    </>
  );

  // --- Diseño de escritorio: panel de marca + tarjeta de formulario ---
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
          <View style={styles.card}>{form}</View>
        </View>
      </View>
    );
  }

  // --- Diseño móvil original ---
  return <View style={styles.container}>{form}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: SIZES.padding * 2,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: SIZES.font * 2,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SIZES.padding * 2,
    color: COLORS.textPrimary,
  },
  input: {
    height: 50,
    borderColor: COLORS.neutral,
    borderWidth: 1,
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.padding,
    marginBottom: SIZES.padding,
  },

  // --- Escritorio ---
  desktopRoot: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: COLORS.background,
  },
  brandPanel: {
    flex: 1,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    paddingHorizontal: SIZES.padding * 4,
  },
  brandTitle: {
    fontFamily: FONTS.heading.fontFamily,
    fontSize: SIZES.font * 3.4,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SIZES.padding,
  },
  brandSubtitle: {
    fontFamily: FONTS.body.fontFamily,
    fontSize: SIZES.font * 1.4,
    color: COLORS.textSecondary,
    maxWidth: 420,
    lineHeight: SIZES.font * 2,
  },
  formPanel: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding * 2,
  },
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
});

export default LoginScreen;
