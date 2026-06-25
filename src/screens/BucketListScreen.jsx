import React from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';

import BudgetProgressCard from '../components/budgets/BudgetProgressCard';
import BudgetCategory from '../components/budgets/BudgetCategory';
import DebtCard from '../components/debts/DebtCard';
import FAB from '../components/FAB';
import PrimaryButton from '../components/PrimaryButton';

import { useGetBuckets } from '../hooks/useBucketData';
import { useIsDesktop } from '../hooks/useResponsive';
import { KIND } from '../constants/bucketKinds';
import { COLORS, SIZES } from '../constants/theme';

// Pantalla de lista única para todos los kinds. Reemplaza a Budgets/Savings/Debts/
// InvestmentsScreen. Se parametriza con `kind` (vía initialParams en la navegación),
// conservando los mismos nombres de ruta para no tocar las llamadas existentes.
//
// `queryKey` reutiliza las claves de los hooks por dominio para compartir caché
// con HomeScreen. `variant` decide el item: 'progress' (barra) o 'simple' (deuda).
const CONFIG = {
  [KIND.BUDGET]: {
    queryKey: ['budgets'], variant: 'progress',
    single: 'SingleBudgetScreen', add: 'AddBudgetScreen', param: 'budget',
    emptyIcon: 'wallet', emptyText: 'No hay presupuestos registrados', addLabel: 'Agregar Presupuesto',
  },
  [KIND.SAVING]: {
    queryKey: ['savings'], variant: 'progress',
    single: 'SingleSavingScreen', add: 'AddSavingScreen', param: 'saving',
    emptyIcon: 'savings', emptyText: 'No hay ahorros programados', addLabel: 'Agregar ahorro',
  },
  [KIND.DEBT]: {
    queryKey: ['debts'], variant: 'simple',
    single: 'SingleDebtScreen', add: 'AddDebtScreen', param: 'debt',
    emptyIcon: 'credit-card-off', emptyText: 'No hay deudas programadas', addLabel: 'Agregar Deuda',
  },
  [KIND.INVESTMENT]: {
    queryKey: ['investments'], variant: 'progress',
    single: 'SingleInvestmentScreen', add: 'AddInvestmentScreen', param: 'investment',
    emptyIcon: 'trending-up', emptyText: 'No hay inversiones registradas', addLabel: 'Agregar Inversión',
  },
};

const BucketListScreen = () => {
  const navigation = useNavigation();
  const isDesktop = useIsDesktop();
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
        <PrimaryButton onPress={() => navigation.navigate(cfg.add)} title={cfg.addLabel} />
      </View>
    );
  }

  const totalUsed = items.reduce((a, b) => a + (b.used || 0), 0);
  const totalTarget = items.reduce((a, b) => a + (b.total || 0), 0);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={[styles.scrollContainer, isDesktop && styles.scrollContainerDesktop]}>
        {cfg.variant === 'progress' && (
          <BudgetProgressCard title="Total" used={totalUsed} total={totalTarget} color={COLORS.primary} />
        )}

        {items.map((item, index) => (
          <TouchableOpacity
            key={item.id ?? index}
            onPress={() => navigation.navigate(cfg.single, { [cfg.param]: item })}
          >
            {cfg.variant === 'progress' ? (
              <BudgetCategory name={item.name} used={item.used} total={item.total} color={item.color} />
            ) : (
              <DebtCard name={item.name} total={item.total} />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FAB onPress={() => navigation.navigate(cfg.add)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  msg: {
    fontSize: 18,
    fontWeight: 'bold',
    padding: SIZES.padding,
  },
  scrollContainer: {
    padding: SIZES.padding,
  },
  scrollContainerDesktop: {
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
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
});

export default BucketListScreen;
