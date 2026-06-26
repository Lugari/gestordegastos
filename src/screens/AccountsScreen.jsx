import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { useGetAccounts, useManageAccounts } from '../hooks/useAccountsData';
import { useCurrency } from '../context/CurrencyContext';
import { useIsDesktop } from '../hooks/useResponsive';
import { CURRENCIES, getCurrency } from '../constants/currencies';
import { COLORS, SIZES } from '../constants/theme';

const COLOR_PALETTE = ['#ADC4CD', '#95E495', '#E4EB2A', '#D76A61', '#A77DDB', '#F9DC5C'];

const AccountsScreen = () => {
  const isDesktop = useIsDesktop();
  const { baseCurrency } = useCurrency();
  const { data: accounts = [] } = useGetAccounts();
  const { addAccount, deleteAccount } = useManageAccounts();

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
  };

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={[styles.content, isDesktop && styles.contentDesktop]}>
        {/* Alta de cuenta */}
        <Text style={styles.section}>NUEVA CUENTA</Text>
        <TextInput
          style={styles.input}
          placeholder="Nombre (ej: Banco, Efectivo, Tarjeta)"
          placeholderTextColor={COLORS.neutral}
          value={name}
          onChangeText={setName}
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

        <TouchableOpacity style={[styles.addBtn, !name.trim() && styles.addBtnDisabled]} disabled={!name.trim()} onPress={handleAdd}>
          <MaterialIcons name="add" size={20} color={COLORS.textPrimary} />
          <Text style={styles.addBtnText}>Agregar cuenta</Text>
        </TouchableOpacity>

        {/* Lista de cuentas */}
        <Text style={styles.section}>MIS CUENTAS</Text>
        {accounts.length === 0 ? (
          <Text style={styles.empty}>No tienes cuentas. Crea una arriba.</Text>
        ) : (
          accounts.map((a) => (
            <View key={a.id} style={styles.accountRow}>
              <View style={[styles.dot, { backgroundColor: a.color || COLORS.primary }]} />
              <Text style={styles.accountName} numberOfLines={1}>{a.name}</Text>
              <Text style={styles.accountCurrency}>{getCurrency(a.currency).symbol} {a.currency}</Text>
              <TouchableOpacity onPress={() => deleteAccount(a.id)}>
                <MaterialIcons name="delete-outline" size={22} color={COLORS.danger} />
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SIZES.padding, paddingBottom: 40 },
  contentDesktop: { width: '100%', maxWidth: 640, alignSelf: 'center' },
  section: {
    fontSize: SIZES.font,
    fontWeight: 'bold',
    color: COLORS.neutral,
    marginTop: SIZES.padding * 1.5,
    marginBottom: SIZES.base,
  },
  subLabel: {
    fontSize: SIZES.font * 0.9,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginTop: SIZES.padding,
    marginBottom: SIZES.base,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: COLORS.neutral,
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.padding,
    paddingVertical: 10,
    fontSize: SIZES.font,
    color: COLORS.textPrimary,
  },
  currencyRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  currencyChip: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding * 0.4,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.background,
  },
  currencyChipActive: { backgroundColor: COLORS.primary },
  currencyChipText: { fontSize: SIZES.font, fontWeight: '600', color: COLORS.textSecondary },
  currencyChipTextActive: { color: COLORS.textPrimary },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.secondary,
    borderRadius: SIZES.radius,
    paddingVertical: SIZES.padding * 0.7,
    marginTop: SIZES.padding,
  },
  addBtnDisabled: { opacity: 0.4 },
  addBtnText: { fontSize: SIZES.font, fontWeight: 'bold', color: COLORS.textPrimary },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  dot: { width: 12, height: 12, borderRadius: 6 },
  accountName: { flex: 1, fontSize: SIZES.font, color: COLORS.textPrimary, fontWeight: '600' },
  accountCurrency: { fontSize: SIZES.font, color: COLORS.textSecondary, fontWeight: 'bold' },
  empty: { fontSize: SIZES.font, color: COLORS.textSecondary, marginTop: 6 },
});

export default AccountsScreen;
