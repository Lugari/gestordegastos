import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity, Platform, Alert } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { useGetAccounts, useManageAccounts } from '../hooks/useAccountsData';
import { useCurrency } from '../context/CurrencyContext';
import { useIsDesktop } from '../hooks/useResponsive';
import { CURRENCIES, getCurrency } from '../constants/currencies';
import { COLORS, SIZES } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

const COLOR_PALETTE = ['#ADC4CD', '#95E495', '#E4EB2A', '#D76A61', '#A77DDB', '#F9DC5C'];

const AccountsScreen = () => {
  const { theme } = useTheme();
  const styles = React.useMemo(() => makeStyles(theme), [theme]);
  const isDesktop = useIsDesktop();
  const { baseCurrency } = useCurrency();
  const { data: accounts = [] } = useGetAccounts();
  const { addAccount, deleteAccount } = useManageAccounts();

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState(baseCurrency);

  const handleAdd = async () => {
    if (!name.trim()) return;
    await addAccount({
      name: name.trim(),
      currency,
      color: COLOR_PALETTE[accounts.length % COLOR_PALETTE.length],
    });
    setName('');
    setShowForm(false);
  };

  const confirmDelete = (account) => {
    const msg = `¿Eliminar la cuenta "${account.name}"? Esta acción no se puede deshacer.`;
    if (Platform.OS === 'web') {
      if (window.confirm(msg)) deleteAccount(account.id);
    } else {
      Alert.alert('Eliminar cuenta', msg, [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => deleteAccount(account.id) },
      ]);
    }
  };

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={[styles.content, isDesktop && styles.contentDesktop]}>
        {/* Lista (contenido principal). El título "Cuentas" lo pone el header de navegación. */}
        <Text style={styles.section}>Mis cuentas</Text>

        {accounts.length === 0 ? (
          <Text style={styles.empty}>No tienes cuentas. Crea una abajo.</Text>
        ) : (
          accounts.map((a) => (
            <View key={a.id} style={styles.accountCard}>
              <View style={[styles.accountIcon, { backgroundColor: (a.color || theme.neutral) + '44' }]}>
                <MaterialIcons name="account-balance-wallet" size={18} color={a.color || theme.textSecondary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.accountName} numberOfLines={1}>{a.name}</Text>
                <Text style={styles.accountSub} numberOfLines={1}>{getCurrency(a.currency).name}</Text>
              </View>
              <Text style={styles.accountBadge}>{getCurrency(a.currency).symbol} {a.currency}</Text>
              <TouchableOpacity onPress={() => confirmDelete(a)} accessibilityLabel={`Eliminar ${a.name}`}>
                <MaterialIcons name="delete-outline" size={22} color={theme.danger} />
              </TouchableOpacity>
            </View>
          ))
        )}

        {/* Alta (divulgación progresiva) */}
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowForm((v) => !v)}>
          <MaterialIcons name={showForm ? 'close' : 'add'} size={20} color="#fff" />
          <Text style={styles.addBtnText}>{showForm ? 'Cancelar' : 'Agregar cuenta'}</Text>
        </TouchableOpacity>

        {showForm && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Nueva cuenta</Text>
            <TextInput
              style={styles.input}
              placeholder="Nombre (Banco, Efectivo, Tarjeta)"
              placeholderTextColor={theme.neutral}
              value={name}
              onChangeText={setName}
              autoFocus
            />
            <Text style={styles.subLabel}>Moneda</Text>
            <View style={styles.currencyRow}>
              {CURRENCIES.map((c) => {
                const active = currency === c.code;
                return (
                  <TouchableOpacity
                    key={c.code}
                    style={[styles.currencyChip, active && styles.currencyChipActive]}
                    onPress={() => setCurrency(c.code)}
                  >
                    <Text style={[styles.currencyChipText, active && styles.currencyChipTextActive]}>{c.code}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <TouchableOpacity style={[styles.createBtn, !name.trim() && styles.createBtnDisabled]} disabled={!name.trim()} onPress={handleAdd}>
              <Text style={styles.createBtnText}>Crear cuenta</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const makeStyles = (t) => StyleSheet.create({
  root: { flex: 1, backgroundColor: t.background },
  content: { padding: SIZES.padding, paddingBottom: 40 },
  contentDesktop: { width: '100%', maxWidth: 640, alignSelf: 'center' },
  title: { fontSize: SIZES.font * 1.6, fontWeight: '600', color: t.textPrimary, marginBottom: 8 },
  section: { fontSize: SIZES.font * 0.85, color: t.textSecondary, marginTop: 8, marginBottom: 10 },

  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    backgroundColor: t.card,
    borderRadius: SIZES.radius * 1.2,
    padding: 11,
    marginBottom: 8,
  },
  accountIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  accountName: { fontSize: SIZES.font * 1.05, fontWeight: '500', color: t.textPrimary },
  accountSub: { fontSize: SIZES.font * 0.8, color: t.textSecondary, marginTop: 2 },
  accountBadge: { fontSize: SIZES.font * 0.85, color: t.textSecondary, backgroundColor: t.cardAlt, paddingHorizontal: 9, paddingVertical: 3, borderRadius: 10, overflow: 'hidden' },
  empty: { fontSize: SIZES.font, color: t.textSecondary, marginVertical: 6 },

  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: t.green,
    borderRadius: SIZES.radius * 1.2,
    paddingVertical: 12,
    marginTop: 8,
  },
  addBtnText: { fontSize: SIZES.font, fontWeight: '700', color: '#fff' },

  formCard: {
    backgroundColor: t.card,
    borderWidth: 1,
    borderColor: t.border,
    borderRadius: SIZES.radius * 1.2,
    padding: SIZES.padding,
    marginTop: 8,
  },
  formTitle: { fontSize: SIZES.font * 0.85, color: t.textSecondary, marginBottom: 8 },
  input: {
    backgroundColor: t.background,
    borderWidth: 1,
    borderColor: t.border,
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.padding,
    paddingVertical: 10,
    fontSize: SIZES.font,
    color: t.textPrimary,
  },
  subLabel: { fontSize: SIZES.font * 0.85, color: t.textSecondary, marginTop: 14, marginBottom: 8 },
  currencyRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  currencyChip: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding * 0.4,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: t.border,
    backgroundColor: t.background,
  },
  currencyChipActive: { backgroundColor: t.green, borderColor: t.green },
  currencyChipText: { fontSize: SIZES.font, fontWeight: '600', color: t.textSecondary },
  currencyChipTextActive: { color: '#fff' },
  createBtn: { backgroundColor: t.green, borderRadius: SIZES.radius, paddingVertical: 12, alignItems: 'center', marginTop: 16 },
  createBtnDisabled: { opacity: 0.4 },
  createBtnText: { fontSize: SIZES.font, fontWeight: '700', color: '#fff' },
});

export default AccountsScreen;
