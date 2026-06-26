import React, { useContext } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

import { AuthContext } from '../context/AuthContext';
import { useIsDesktop } from '../hooks/useResponsive';
import { COLORS, SIZES } from '../constants/theme';

// Pantalla "Más" (placeholder de Fase 1). En Fase 2 absorberá el menú del Header
// con grupos (Perfil, Cuentas y moneda, Datos, Sesión).
const Option = ({ icon, label, onPress, danger }) => (
  <TouchableOpacity style={styles.row} onPress={onPress}>
    <MaterialIcons name={icon} size={24} color={danger ? COLORS.danger : COLORS.textSecondary} />
    <Text style={[styles.rowText, danger && { color: COLORS.danger }]}>{label}</Text>
    <MaterialIcons name="chevron-right" size={22} color={COLORS.neutral} />
  </TouchableOpacity>
);

const MoreScreen = () => {
  const navigation = useNavigation();
  const isDesktop = useIsDesktop();
  const { logout } = useContext(AuthContext);

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={[styles.content, isDesktop && styles.contentDesktop]}>
        <Text style={styles.title}>Más</Text>
        <Option icon="account-balance-wallet" label="Cuentas" onPress={() => navigation.navigate('AccountsScreen')} />
        <Option icon="bar-chart" label="Reportes" onPress={() => navigation.navigate('ReportsScreen')} />
        <Option icon="logout" label="Cerrar sesión" onPress={logout} danger />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SIZES.padding, paddingBottom: 40 },
  contentDesktop: { width: '100%', maxWidth: 640, alignSelf: 'center' },
  title: { fontSize: SIZES.font * 1.8, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: SIZES.padding },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  rowText: { flex: 1, fontSize: SIZES.font * 1.1, color: COLORS.textPrimary },
});

export default MoreScreen;
