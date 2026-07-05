import React from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';

import { useGetBuckets } from '../hooks/useBucketData';
import { useIsDesktop } from '../hooks/useResponsive';
import { useCurrency } from '../context/CurrencyContext';
import { KIND } from '../constants/bucketKinds';
import { COLORS, SIZES } from '../constants/theme';

// Pantalla de lista única para todos los kinds. Reemplaza a Budgets/Savings/Debts/
// InvestmentsScreen. Se parametriza con `kind` (vía initialParams en la navegación),
// conservando los mismos nombres de ruta para no tocar las llamadas existentes.
//
// `queryKey` reutiliza las claves de los hooks por dominio para compartir caché
// con HomeScreen. `variant` decide el item: 'progress' (barra) o 'simple' (deuda).
const GREEN = '#1C6B52';
const DEBT_RED = '#B5453A';

const CONFIG = {
  [KIND.BUDGET]: {
    queryKey: ['budgets'], variant: 'progress',
    single: 'SingleBudgetScreen', add: 'AddBudgetScreen', param: 'budget',
    title: 'Presupuestos', singular: 'presupuesto', progressLabel: 'Usado', progressMode: 'available',
    emptyIcon: 'wallet', emptyText: 'No hay presupuestos registrados', addLabel: 'Agregar presupuesto',
  },
  [KIND.SAVING]: {
    queryKey: ['savings'], variant: 'progress',
    single: 'SingleSavingScreen', add: 'AddSavingScreen', param: 'saving',
    title: 'Ahorros', singular: 'ahorro', progressLabel: 'Ahorrado', progressMode: 'completed',
    emptyIcon: 'savings', emptyText: 'No hay ahorros programados', addLabel: 'Agregar ahorro',
  },
  [KIND.DEBT]: {
    queryKey: ['debts'], variant: 'simple',
    single: 'SingleDebtScreen', add: 'AddDebtScreen', param: 'debt',
    title: 'Deudas', singular: 'deuda',
    emptyIcon: 'credit-card-off', emptyText: 'No hay deudas programadas', addLabel: 'Agregar deuda',
  },
  [KIND.INVESTMENT]: {
    queryKey: ['investments'], variant: 'progress',
    single: 'SingleInvestmentScreen', add: 'AddInvestmentScreen', param: 'investment',
    title: 'Inversiones', singular: 'inversión', progressLabel: 'Invertido', progressMode: 'completed',
    emptyIcon: 'trending-up', emptyText: 'No hay inversiones registradas', addLabel: 'Agregar inversión',
  },
};

const BucketListScreen = () => {
  const navigation = useNavigation();
  const isDesktop = useIsDesktop();
  const { format } = useCurrency();
  const { kind } = useRoute().params || {};
  const cfg = CONFIG[kind];

  const { data: items = [], isLoading, error } = useGetBuckets(kind, cfg?.queryKey ?? ['buckets', kind]);

  if (!cfg) return null;

  if (isLoading) {
    return <View style={styles.container}><Text style={styles.msg}>Cargando...</Text></View>;
  }
  if (error) {
    return <View style={styles.container}><Text style={styles.msg}>Error al cargar los datos</Text></View>;
  }

  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialIcons name={cfg.emptyIcon} size={48} color="#cdd1c5" />
        <Text style={styles.emptyText}>{cfg.emptyText}</Text>
        <TouchableOpacity style={styles.emptyCta} onPress={() => navigation.navigate(cfg.add)}>
          <MaterialIcons name="add" size={20} color="#fff" />
          <Text style={styles.emptyCtaText}>{cfg.addLabel}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const totalUsed = items.reduce((a, b) => a + (b.used || 0), 0);
  const totalTarget = items.reduce((a, b) => a + (b.total || 0), 0);
  const totalRemaining = items.reduce((a, b) => a + Math.max(0, (b.total || 0) - (b.used || 0)), 0);
  const usedPct = totalTarget > 0 ? Math.min(totalUsed / totalTarget, 1) : 0;

  // Texto resumen del héroe según el kind (singular/plural correcto).
  const countLabel = `${items.length} ${items.length === 1 ? cfg.singular : cfg.title.toLowerCase()}`;
  const heroSub =
    cfg.progressMode === 'available'
      ? `${countLabel} · ${Math.round((1 - usedPct) * 100)}% disponible`
      : `${countLabel} · ${Math.round(usedPct * 100)}% completado`;

  const renderProgressItem = (item) => {
    const used = item.used || 0;
    const total = item.total || 0;
    const pct = total > 0 ? Math.min(used / total, 1) : 0;
    const color = item.color || GREEN;
    return (
      <>
        <View style={[styles.iconCircle, { backgroundColor: color }]}>
          <MaterialIcons name={item.icon || 'wallet'} size={18} color="#5f5a67" />
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.itemTop}>
            <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.itemPct}>{Math.round(pct * 100)}%</Text>
          </View>
          <Text style={styles.itemSub}>{format(used)} / {format(total)}</Text>
          <View style={styles.track}><View style={[styles.fill, { width: `${pct * 100}%`, backgroundColor: color }]} /></View>
        </View>
      </>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={[styles.scrollContainer, isDesktop && styles.scrollContainerDesktop]}>
        {/* El título lo pone el header de navegación. */}

        {/* Resumen (héroe) */}
        {cfg.variant === 'progress' ? (
          <View style={styles.hero}>
            <Text style={styles.heroLabel}>{cfg.progressLabel}</Text>
            <Text style={styles.heroValue}>
              {format(totalUsed)} <Text style={styles.heroValueSmall}>/ {format(totalTarget)}</Text>
            </Text>
            <View style={styles.heroTrack}><View style={[styles.heroFill, { width: `${usedPct * 100}%` }]} /></View>
            <Text style={styles.heroSub}>{heroSub}</Text>
          </View>
        ) : (
          <View style={[styles.hero, { backgroundColor: DEBT_RED }]}>
            <Text style={styles.heroLabel}>Deuda total</Text>
            <Text style={styles.heroValue}>{format(totalRemaining)}</Text>
            <Text style={styles.heroSub}>{countLabel}</Text>
          </View>
        )}

        {/* Ítems */}
        {items.map((item, index) => (
          <TouchableOpacity
            key={item.id ?? index}
            style={styles.itemCard}
            activeOpacity={0.7}
            onPress={() => navigation.navigate(cfg.single, { [cfg.param]: item })}
          >
            {cfg.variant === 'progress' ? (
              renderProgressItem(item)
            ) : (
              <>
                <View style={[styles.iconCircle, { backgroundColor: '#FBEAF0' }]}>
                  <MaterialIcons name="credit-card" size={18} color="#993556" />
                </View>
                <Text style={[styles.itemName, { flex: 1 }]} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.debtAmount}>{format(Math.max(0, (item.total || 0) - (item.used || 0)))}</Text>
              </>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.fab} activeOpacity={0.85} onPress={() => navigation.navigate(cfg.add)} accessibilityLabel={cfg.addLabel}>
        <MaterialIcons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  msg: {
    fontSize: 18,
    fontWeight: 'bold',
    padding: SIZES.padding,
  },
  scrollContainer: {
    padding: SIZES.padding,
    paddingBottom: 90,
  },
  scrollContainerDesktop: {
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
  },
  screenTitle: {
    fontSize: SIZES.font * 1.6,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },

  hero: {
    backgroundColor: GREEN,
    borderRadius: SIZES.radius * 1.4,
    padding: SIZES.padding,
    marginBottom: SIZES.padding,
  },
  heroLabel: { fontSize: SIZES.font * 0.9, color: 'rgba(255,255,255,0.82)' },
  heroValue: { fontSize: SIZES.font * 1.9, fontWeight: '700', color: '#fff', marginTop: 2 },
  heroValueSmall: { fontSize: SIZES.font, fontWeight: '500', color: 'rgba(255,255,255,0.7)' },
  heroTrack: { height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.25)', marginTop: 10, overflow: 'hidden' },
  heroFill: { height: '100%', borderRadius: 4, backgroundColor: '#fff' },
  heroSub: { fontSize: SIZES.font * 0.85, color: 'rgba(255,255,255,0.85)', marginTop: 8 },

  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: SIZES.radius * 1.2,
    padding: 12,
    marginBottom: 10,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemName: { fontSize: SIZES.font * 1.05, fontWeight: '500', color: COLORS.textPrimary },
  itemPct: { fontSize: SIZES.font * 0.85, color: COLORS.textSecondary, fontWeight: '600' },
  itemSub: { fontSize: SIZES.font * 0.8, color: COLORS.textSecondary, marginTop: 2, marginBottom: 6 },
  track: { height: 7, borderRadius: 4, backgroundColor: '#ECECE3', overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4 },
  debtAmount: { fontSize: SIZES.font * 1.05, fontWeight: '600', color: '#A32D2D' },

  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: GREEN,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },

  emptyContainer: {
    backgroundColor: COLORS.background,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding * 2.2,
    gap: 14,
  },
  emptyText: {
    fontSize: SIZES.font * 1.1,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  emptyCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: GREEN,
    borderRadius: SIZES.radius * 1.2,
    paddingHorizontal: SIZES.padding * 1.2,
    paddingVertical: SIZES.padding * 0.7,
  },
  emptyCtaText: { color: '#fff', fontSize: SIZES.font, fontWeight: '600' },
});

export default BucketListScreen;
