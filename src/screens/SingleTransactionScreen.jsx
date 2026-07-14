import React, { useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { useManageTransactions } from '../hooks/useTransactionData';
import { useGetAccounts } from '../hooks/useAccountsData';
import { useIsDesktop } from '../hooks/useResponsive';
import { useCurrency } from '../context/CurrencyContext';
import { SIZES } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';



// Tinte y color de monto por tipo (semántico).
const typeStyles = (t) => ({
  gasto: { bg: t.expenseSoft, amount: t.expense, chip: t.expenseStrong, label: 'Gasto', sign: '−' },
  ingreso: { bg: t.incomeSoft, amount: t.income, chip: t.incomeStrong, label: 'Ingreso', sign: '+' },
  ahorro: { bg: t.savingSoft, amount: t.saving, chip: t.savingStrong, label: 'Ahorro', sign: '−' },
});

const SingleTransactionScreen = () => {
  const { theme } = useTheme();
  const styles = React.useMemo(() => makeStyles(theme), [theme]);
  const GREEN = theme.green;
  const TYPE_STYLE = typeStyles(theme);
  const route = useRoute();
  const navigation = useNavigation();
  const isDesktop = useIsDesktop();
  const { transaction, categoryName, categoryIcon, categoryColor } = route.params;

  const { deleteTransaction } = useManageTransactions();
  const { data: accounts = [] } = useGetAccounts();
  const { formatIn, convert, currency: displayCurrency } = useCurrency();

  const type = (transaction.type || 'gasto').toLowerCase();
  const ts = TYPE_STYLE[type] || TYPE_STYLE.gasto;
  const txCurrency = transaction.currency || displayCurrency;
  const showConverted = txCurrency !== displayCurrency;
  const accountName = accounts.find((a) => a.id === transaction.account)?.name;

  const handleEdit = useCallback(() => {
    navigation.navigate('AddTransactionScreen', { transaction });
  }, [navigation, transaction]);

  const handleDelete = useCallback(() => {
    const doDelete = async () => {
      try {
        await deleteTransaction({
          transactionId: transaction.id,
          budgetId: transaction.budget_id,
          amount: transaction.amount,
          type: transaction.type,
          currency: transaction.currency,
        });
        // Pantalla del stack raíz: el historial es una pestaña anidada en MainTabs.
        navigation.navigate('MainTabs', { screen: 'TransactionHistoryScreen' });
      } catch (e) {
        if (Platform.OS === 'web') window.alert('No se pudo eliminar.');
        else Alert.alert('Error', 'No se pudo eliminar.');
      }
    };
    const msg = '¿Eliminar esta transacción? Esta acción no se puede deshacer.';
    if (Platform.OS === 'web') {
      if (window.confirm(msg)) doDelete();
    } else {
      Alert.alert('Eliminar transacción', msg, [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: doDelete },
      ]);
    }
  }, [transaction, deleteTransaction, navigation]);

  const meta = [
    { label: 'Fecha', value: new Date(transaction.date).toLocaleDateString('es-CO') },
    { label: 'Cuenta', value: accountName || 'Cuenta principal' },
    { label: 'Moneda', value: txCurrency },
    { label: 'Tipo', value: ts.label },
  ];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={[styles.content, isDesktop && styles.contentDesktop]}>
      {/* Encabezado: el título lo pone el header de navegación. */}
      <View style={[styles.headerRow, { justifyContent: 'flex-end' }]}>
        <TouchableOpacity onPress={handleEdit} accessibilityLabel="Editar">
          <MaterialIcons name="edit" size={22} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Héroe (tinte por tipo) */}
      <View style={[styles.hero, { backgroundColor: ts.bg }]}>
        <View style={styles.heroTop}>
          <View style={styles.catWrap}>
            <View style={styles.catIcon}>
              <MaterialIcons name={categoryIcon || 'paid'} size={17} color={categoryColor || ts.chip} />
            </View>
            <Text style={[styles.catName, { color: ts.chip }]} numberOfLines={1}>{categoryName || 'Cuenta principal'}</Text>
          </View>
          <Text style={[styles.typeChip, { color: ts.chip }]}>{ts.label}</Text>
        </View>
        <Text style={[styles.amount, { color: ts.amount }]}>{ts.sign}{formatIn(transaction.amount, txCurrency)}</Text>
        {showConverted && (
          <Text style={styles.converted}>
            ≈ {formatIn(convert(transaction.amount, txCurrency, displayCurrency), displayCurrency)} {displayCurrency}
          </Text>
        )}
      </View>

      {/* Metadatos */}
      <View style={styles.metaGrid}>
        {meta.map((m) => (
          <View key={m.label} style={styles.metaCard}>
            <Text style={styles.metaLabel}>{m.label}</Text>
            <Text style={styles.metaValue}>{m.value}</Text>
          </View>
        ))}
      </View>

      {/* Nota */}
      {transaction.notes ? (
        <View style={styles.noteCard}>
          <Text style={styles.metaLabel}>Nota</Text>
          <Text style={styles.noteText}>{transaction.notes}</Text>
        </View>
      ) : null}

      {/* Acciones */}
      <TouchableOpacity style={styles.editBtn} onPress={handleEdit}>
        <Text style={styles.editText}>Editar</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
        <Text style={styles.deleteText}>Eliminar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const makeStyles = (t) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: t.background },
  content: { padding: SIZES.padding, paddingBottom: 40 },
  contentDesktop: { width: '100%', maxWidth: 640, alignSelf: 'center' },

  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  title: { fontSize: SIZES.font * 1.6, fontWeight: '600', color: t.textPrimary },

  hero: { borderRadius: SIZES.radius * 1.4, padding: SIZES.padding },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  catWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  catIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: t.card, justifyContent: 'center', alignItems: 'center' },
  catName: { fontSize: SIZES.font, fontWeight: '500' },
  typeChip: { fontSize: SIZES.font * 0.78, backgroundColor: t.card, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 11, overflow: 'hidden' },
  amount: { fontSize: SIZES.font * 2.2, fontWeight: '700', marginTop: 10 },
  converted: { fontSize: SIZES.font * 0.9, color: t.textSecondary, marginTop: 2 },

  metaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  metaCard: { flexBasis: '47%', flexGrow: 1, backgroundColor: t.cardAlt, borderRadius: 10, paddingVertical: 9, paddingHorizontal: 11 },
  metaLabel: { fontSize: SIZES.font * 0.78, color: t.neutral },
  metaValue: { fontSize: SIZES.font * 0.95, color: t.textPrimary, marginTop: 2 },

  noteCard: { backgroundColor: t.card, borderRadius: 10, padding: 11, marginTop: 10 },
  noteText: { fontSize: SIZES.font * 0.95, color: t.textPrimary, marginTop: 2 },

  editBtn: { marginTop: 24, backgroundColor: t.green, borderRadius: SIZES.radius * 1.2, paddingVertical: 14, alignItems: 'center' },
  editText: { color: '#fff', fontSize: SIZES.font * 1.1, fontWeight: '700' },
  deleteBtn: { marginTop: 10, borderWidth: 1, borderColor: '#D4948C', borderRadius: SIZES.radius * 1.2, paddingVertical: 12, alignItems: 'center' },
  deleteText: { color: t.expense, fontSize: SIZES.font, fontWeight: '600' },
});

export default SingleTransactionScreen;
