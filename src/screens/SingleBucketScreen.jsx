import React, { useCallback, useMemo } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Platform, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import { useManageBuckets } from '../hooks/useBucketData';
import { useGetTransactions } from '../hooks/useTransactionData';
import { useIsDesktop } from '../hooks/useResponsive';
import { useCurrency } from '../context/CurrencyContext';
import { KIND } from '../constants/bucketKinds';
import { SIZES } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

// Pantalla de detalle única para todos los kinds. Reemplaza a Single{Budget,
// Saving,Debt,Investment}Screen. Se parametriza con `kind` (initialParams),
// conservando los mismos nombres de ruta para no tocar las llamadas existentes.
const DEBT_RED = '#B5453A';

const DEBT_LABELS = {
  'credit card': 'Tarjeta',
  'free investment': 'Libre inversión',
  vehicle: 'Vehículo',
  'mortgage loan': 'Hipoteca',
  estudies: 'Estudios',
  other: 'Otra',
};

const CONFIG = {
  [KIND.BUDGET]: { param: 'budget', add: 'AddBudgetScreen', queryKey: ['budgets'], variant: 'progress', heroLabel: 'Disponible', showTransactions: true, addTxType: 'gasto', kindLabel: 'presupuesto' },
  [KIND.SAVING]: { param: 'saving', add: 'AddSavingScreen', queryKey: ['savings'], variant: 'progress', heroLabel: 'Te falta', showTransactions: true, addTxType: 'ahorro', kindLabel: 'ahorro' },
  [KIND.DEBT]: { param: 'debt', add: 'AddDebtScreen', queryKey: ['debts'], variant: 'debt', kindLabel: 'deuda' },
  [KIND.INVESTMENT]: { param: 'investment', add: 'AddInvestmentScreen', queryKey: ['investments'], variant: 'progress', heroLabel: 'Te falta', kindLabel: 'inversión' },
};

const fmtDate = (x) => (x ? new Date(x).toLocaleDateString('es-CO') : '—');

// Metadatos compactos por kind (grilla de mini-tarjetas).
const metaFor = (kind, item, format) => {
  switch (kind) {
    case KIND.BUDGET:
      return [
        { label: 'Período', value: item.period || '—' },
        { label: 'Inicio', value: fmtDate(item.date) },
        { label: 'Actualizado', value: fmtDate(item.updated_at) },
      ];
    case KIND.SAVING:
      return [
        { label: 'Plazo', value: fmtDate(item.deadline) },
        { label: 'Inicio', value: fmtDate(item.created_at) },
        { label: 'Actualizado', value: fmtDate(item.updated_at) },
      ];
    case KIND.INVESTMENT:
      return [
        { label: 'Rentabilidad', value: `${item.roi || 0}% anual` },
        { label: 'Retorno est./año', value: format(Math.round(((item.used || 0) * (item.roi || 0)) / 100)) },
        { label: 'Inicio', value: fmtDate(item.created_at) },
        { label: 'Actualizado', value: fmtDate(item.updated_at) },
      ];
    case KIND.DEBT:
      return [
        { label: 'Tipo', value: DEBT_LABELS[item.type] || item.type || '—' },
        { label: 'Interés', value: `${item.apr || 0}%` },
        { label: 'Cuotas', value: item.fees ? String(item.fees) : '—' },
        { label: 'Inicio', value: fmtDate(item.created_at) },
      ];
    default:
      return [];
  }
};

const SingleBucketScreen = () => {
  const { theme } = useTheme();
  const styles = React.useMemo(() => makeStyles(theme), [theme]);
  const GREEN = theme.green, INCOME = theme.income, EXPENSE = theme.expense, SAVING_C = theme.saving;
  const navigation = useNavigation();
  const isDesktop = useIsDesktop();
  const { kind, ...rest } = useRoute().params || {};
  const cfg = CONFIG[kind];

  const { format, formatIn } = useCurrency();
  const { deleteMutation } = useManageBuckets(kind, cfg?.queryKey ?? ['buckets', kind]);
  const { data: transactions = [] } = useGetTransactions();

  const item = cfg ? rest[cfg.param] : null;

  const movements = useMemo(() => {
    if (!cfg?.showTransactions || !item) return [];
    return transactions
      .filter((t) => t.budget_id === item.id)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions, item, cfg]);

  const handleEdit = useCallback(() => {
    navigation.navigate(cfg.add, { toEdit: item });
  }, [navigation, cfg, item]);

  const handleDelete = useCallback(() => {
    const doDelete = async () => {
      try {
        await deleteMutation.mutateAsync(item.id);
        navigation.goBack();
      } catch (e) {
        if (Platform.OS === 'web') window.alert('No se pudo eliminar.');
        else Alert.alert('Error', 'No se pudo eliminar.');
      }
    };
    const msg = `¿Eliminar "${item.name}"? Esta acción no se puede deshacer.`;
    if (Platform.OS === 'web') {
      if (window.confirm(msg)) doDelete();
    } else {
      Alert.alert(`Eliminar ${cfg.kindLabel}`, msg, [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: doDelete },
      ]);
    }
  }, [deleteMutation, item, cfg, navigation]);

  if (!cfg || !item) return null;

  const used = item.used || 0;
  const total = item.total || 0;
  const remaining = total - used;
  const pct = total > 0 ? Math.min(Math.max(used / total, 0), 1) : 0;
  const exceeded = cfg.variant === 'progress' && remaining < 0;
  const meta = metaFor(kind, item, format);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={[styles.content, isDesktop && styles.contentDesktop]}>
      {/* Encabezado */}
      <View style={styles.headerRow}>
        <Text style={styles.title} numberOfLines={1}>{item.name}</Text>
        <TouchableOpacity onPress={handleEdit} accessibilityLabel="Editar">
          <MaterialIcons name="edit" size={22} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Héroe */}
      {cfg.variant === 'progress' ? (
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <Text style={styles.heroLabel}>{exceeded ? 'Excedido' : cfg.heroLabel}</Text>
            {item.period ? <Text style={styles.heroTag}>{item.period}</Text> : null}
          </View>
          <Text style={styles.heroValue}>{format(Math.abs(remaining))}</Text>
          <View style={styles.heroTrack}><View style={[styles.heroFill, { width: `${pct * 100}%`, backgroundColor: exceeded ? '#F2C0B8' : '#fff' }]} /></View>
          <Text style={styles.heroSub}>{format(used)} de {format(total)} · {Math.round((total > 0 ? used / total : 0) * 100)}%</Text>
        </View>
      ) : (
        <View style={[styles.hero, { backgroundColor: DEBT_RED }]}>
          <Text style={styles.heroLabel}>Saldo total</Text>
          <Text style={styles.heroValue}>{format(total)}</Text>
          <Text style={styles.heroSub}>{DEBT_LABELS[item.type] || item.type || ''}</Text>
        </View>
      )}

      {/* Metadatos (grilla) */}
      <View style={styles.metaGrid}>
        {meta.map((m) => (
          <View key={m.label} style={styles.metaCard}>
            <Text style={styles.metaLabel}>{m.label}</Text>
            <Text style={styles.metaValue}>{m.value}</Text>
          </View>
        ))}
      </View>

      {/* Nota */}
      {item.notes ? (
        <View style={styles.noteCard}>
          <Text style={styles.metaLabel}>Nota</Text>
          <Text style={styles.noteText}>{item.notes}</Text>
        </View>
      ) : null}

      {/* Movimientos */}
      {cfg.showTransactions && (
        <>
          <View style={styles.movHeader}>
            <Text style={styles.sectionLabel}>Movimientos</Text>
            <TouchableOpacity style={styles.addMov} onPress={() => navigation.navigate('AddTransactionScreen', { transactionType: cfg.addTxType })}>
              <MaterialIcons name="add" size={16} color={GREEN} />
              <Text style={styles.addMovText}>Registrar</Text>
            </TouchableOpacity>
          </View>
          {movements.length === 0 ? (
            <Text style={styles.emptyMov}>Sin movimientos aún.</Text>
          ) : (
            movements.map((t) => {
              const type = (t.type || '').toLowerCase();
              const sign = type === 'ingreso' ? '+' : '−';
              const color = type === 'ingreso' ? INCOME : type === 'gasto' ? EXPENSE : SAVING_C;
              return (
                <View key={t.id} style={styles.movRow}>
                  <View style={[styles.movIcon, { backgroundColor: (item.color || '#D9D9D9') + '33' }]}>
                    <MaterialIcons name={item.icon || 'paid'} size={18} color={item.color || '#5f6b62'} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.movName} numberOfLines={1}>{t.notes || item.name}</Text>
                    <Text style={styles.movDate}>{new Date(t.date).toLocaleDateString('es-CO')}</Text>
                  </View>
                  <Text style={[styles.movAmount, { color }]}>{sign}{formatIn(t.amount, t.currency)}</Text>
                </View>
              );
            })
          )}
        </>
      )}

      {/* Acciones */}
      <TouchableOpacity style={styles.editBtn} onPress={handleEdit}>
        <Text style={styles.editText}>Editar</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete} disabled={deleteMutation.isPending}>
        <Text style={styles.deleteText}>Eliminar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const makeStyles = (t) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: t.background },
  content: { padding: SIZES.padding, paddingBottom: 40 },
  contentDesktop: { width: '100%', maxWidth: 760, alignSelf: 'center' },

  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  title: { flex: 1, fontSize: SIZES.font * 1.6, fontWeight: '600', color: t.textPrimary },

  hero: { backgroundColor: t.green, borderRadius: SIZES.radius * 1.4, padding: SIZES.padding },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heroLabel: { fontSize: SIZES.font * 0.9, color: 'rgba(255,255,255,0.82)' },
  heroTag: { fontSize: SIZES.font * 0.75, color: t.green, backgroundColor: t.card, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, overflow: 'hidden' },
  heroValue: { fontSize: SIZES.font * 2, fontWeight: '700', color: '#fff', marginTop: 2 },
  heroTrack: { height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.25)', marginTop: 10, overflow: 'hidden' },
  heroFill: { height: '100%', borderRadius: 4 },
  heroSub: { fontSize: SIZES.font * 0.85, color: 'rgba(255,255,255,0.85)', marginTop: 8 },

  metaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  metaCard: { flexBasis: '47%', flexGrow: 1, backgroundColor: t.cardAlt, borderRadius: 10, paddingVertical: 9, paddingHorizontal: 11 },
  metaLabel: { fontSize: SIZES.font * 0.78, color: t.neutral },
  metaValue: { fontSize: SIZES.font * 0.95, color: t.textPrimary, marginTop: 2 },

  noteCard: { backgroundColor: t.card, borderRadius: 10, padding: 11, marginTop: 10 },
  noteText: { fontSize: SIZES.font * 0.95, color: t.textPrimary, marginTop: 2 },

  movHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 18, marginBottom: 4 },
  sectionLabel: { fontSize: SIZES.font * 0.9, color: t.textSecondary },
  addMov: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  addMovText: { fontSize: SIZES.font * 0.85, color: t.green, fontWeight: '600' },
  emptyMov: { fontSize: SIZES.font * 0.9, color: t.textSecondary, marginTop: 6 },
  movRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  movIcon: { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center' },
  movName: { fontSize: SIZES.font * 0.95, fontWeight: '500', color: t.textPrimary },
  movDate: { fontSize: SIZES.font * 0.78, color: t.textSecondary, marginTop: 2 },
  movAmount: { fontSize: SIZES.font * 0.95, fontWeight: '600' },

  editBtn: { marginTop: 24, backgroundColor: t.green, borderRadius: SIZES.radius * 1.2, paddingVertical: 14, alignItems: 'center' },
  editText: { color: '#fff', fontSize: SIZES.font * 1.1, fontWeight: '700' },
  deleteBtn: { marginTop: 10, borderWidth: 1, borderColor: '#D4948C', borderRadius: SIZES.radius * 1.2, paddingVertical: 12, alignItems: 'center' },
  deleteText: { color: t.expense, fontSize: SIZES.font, fontWeight: '600' },
});

export default SingleBucketScreen;
