import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';

import { useGetBudgets } from '../hooks/useBudgetsData';
import { useGetTransactions } from '../hooks/useTransactionData';
import { useGetSavings } from '../hooks/useSavingsData';
import { useGetDebts } from '../hooks/useDebtsData';
import { useGetInvestments } from '../hooks/useInvestmentsData';
import { useIsDesktop } from '../hooks/useResponsive';
import { useCurrency } from '../context/CurrencyContext';
import { getCurrency } from '../constants/currencies';

import Header from '../components/Header';

import { COLORS, SIZES } from '../constants/theme';

// Paleta del mockup (cálida y plana).
const PAGE_BG = '#F5F5EF';
const CARD_BG = '#EAEAE0';
const BALANCE_GREEN = '#1C6B52';
const BUDGET_COLOR = '#6FA12A';
const SAVING_COLOR = '#2AA583';
const TRACK_COLOR = '#D8D8CE';

// Titular de balance: tarjeta verde sólida con monto y tendencia del mes.
const BalanceHero = ({ amount, trend }) => (
  <View style={styles.hero}>
    <Text style={styles.heroLabel}>Balance total</Text>
    <Text style={styles.heroAmount}>{amount}</Text>
    {trend != null && (
      <Text style={styles.heroTrend}>
        {trend >= 0 ? '+' : '−'}
        {Math.abs(trend).toFixed(1).replace('.', ',')}% este mes
      </Text>
    )}
  </View>
);

// Tarjeta plana de métrica: etiqueta + valor abreviado.
const MetricCard = ({ label, value, onPress }) => (
  <TouchableOpacity style={styles.card} activeOpacity={0.7} onPress={onPress}>
    <Text style={styles.cardLabel}>{label}</Text>
    <Text style={styles.cardValue}>{value}</Text>
  </TouchableOpacity>
);

// Tarjeta plana de objetivo: etiqueta + barra de progreso agregada.
const ProgressCard = ({ label, ratio, color, onPress }) => (
  <TouchableOpacity style={styles.card} activeOpacity={0.7} onPress={onPress}>
    <Text style={styles.cardLabel}>{label}</Text>
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${Math.min(Math.max(ratio, 0), 1) * 100}%`, backgroundColor: color }]} />
    </View>
  </TouchableOpacity>
);

const HomeScreen = () => {
  const navigation = useNavigation();
  const isDesktop = useIsDesktop();
  const { format, convert, currency, baseCurrency } = useCurrency();

  const { data: transactions = [], isLoading: isLoadingTrasactions } = useGetTransactions();
  const { data: budgets = [], isLoading: isLoadingBudgets } = useGetBudgets();
  const { data: savings = [], isLoading: isLoadingSavings } = useGetSavings();
  const { data: debts = [], isLoading: isLoadingDebts } = useGetDebts();
  const { data: investments = [], isLoading: isLoadingInvestments } = useGetInvestments();

  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalBalance, setTotalBalance] = useState(0);

  useEffect(() => {
    let currentIncome = 0;
    let currentExpense = 0;

    transactions.forEach(transaction => {
      // Convertimos el monto a la moneda base antes de agregar.
      const amount = convert(parseFloat(transaction.amount) || 0, transaction.currency || baseCurrency, baseCurrency);
      if (transaction.type.toLowerCase() === 'ingreso') {
        currentIncome += amount;
      } else if (transaction.type.toLowerCase() === 'gasto') {
        currentExpense += amount;
      } else if (transaction.type.toLowerCase() === 'ahorro') {
        const saving = savings.find(s => s.id === transaction.budget_id);
        if (saving && (saving.showable === false || saving.showable === undefined)) {
          currentExpense += amount;
        }
      }
    });

    setTotalIncome(currentIncome);
    setTotalExpenses(currentExpense);
    setTotalBalance(currentIncome - currentExpense);
  }, [transactions, savings, convert, baseCurrency]);

  // Progreso agregado de presupuestos y ahorros.
  const budgetRatio = useMemo(() => {
    const total = budgets.reduce((a, b) => a + (b.total || 0), 0);
    const used = budgets.reduce((a, b) => a + (b.used || 0), 0);
    return total > 0 ? used / total : 0;
  }, [budgets]);

  const savingRatio = useMemo(() => {
    const total = savings.reduce((a, s) => a + (s.total || 0), 0);
    const used = savings.reduce((a, s) => a + (s.used || 0), 0);
    return total > 0 ? used / total : 0;
  }, [savings]);

  const totalDebts = useMemo(() => debts.reduce((acc, debt) => acc + (debt.total || 0), 0), [debts]);
  const totalInvestments = useMemo(() => investments.reduce((acc, inv) => acc + (inv.used || 0), 0), [investments]);

  // Tendencia: parte del ingreso que se conserva este periodo (tasa de ahorro).
  const trend = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : null;

  // Abrevia un monto (en moneda base) a la de visualización: $5,2M / $800K.
  const symbol = getCurrency(currency).symbol;
  const abbreviate = (baseAmount) => {
    const v = convert(baseAmount);
    const abs = Math.abs(v);
    const sign = v < 0 ? '−' : '';
    let out;
    if (abs >= 1e6) out = `${(abs / 1e6).toFixed(1).replace('.', ',')}M`;
    else if (abs >= 1e3) out = `${Math.round(abs / 1e3)}K`;
    else out = `${Math.round(abs)}`;
    return `${sign}${symbol}${out}`;
  };

  const fling = Gesture.Fling()
    .direction(2)
    .onEnd(() => {
      navigation.navigate('ReportsScreen');
    });

  if (isLoadingTrasactions || isLoadingBudgets || isLoadingSavings || isLoadingDebts || isLoadingInvestments) {
    return <ActivityIndicator />;
  }

  // Contenido común a móvil y escritorio.
  const dashboard = (
    <>
      <TouchableOpacity activeOpacity={0.85} onPress={() => navigation.navigate('TransactionHistoryScreen')}>
        <BalanceHero amount={format(totalBalance)} trend={trend} />
      </TouchableOpacity>

      <View style={styles.group}>
        <Text style={styles.section}>Este mes</Text>
        <View style={styles.row}>
          <MetricCard label="Ingresos" value={abbreviate(totalIncome)} onPress={() => navigation.navigate('AddTransactionScreen', { transactionType: 'ingreso' })} />
          <MetricCard label="Egresos" value={abbreviate(totalExpenses)} onPress={() => navigation.navigate('AddTransactionScreen', { transactionType: 'gasto' })} />
        </View>
      </View>

      <View style={styles.group}>
        <Text style={styles.section}>Mis objetivos</Text>
        <View style={styles.row}>
          <ProgressCard label="Presupuestos" ratio={budgetRatio} color={BUDGET_COLOR} onPress={() => navigation.navigate('BudgetsScreen')} />
          <ProgressCard label="Ahorros" ratio={savingRatio} color={SAVING_COLOR} onPress={() => navigation.navigate('SavingsScreen')} />
        </View>
      </View>

      <View style={styles.group}>
        <Text style={styles.section}>Patrimonio</Text>
        <View style={styles.row}>
          <MetricCard label="Deudas" value={abbreviate(totalDebts)} onPress={() => navigation.navigate('DebtsScreen')} />
          <MetricCard label="Inversiones" value={abbreviate(totalInvestments)} onPress={() => navigation.navigate('InvestmentsScreen')} />
        </View>
      </View>
    </>
  );

  // --- Escritorio: columna centrada ---
  if (isDesktop) {
    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.dScroll}>
        <View style={styles.dPage}>
          <Header />
          {dashboard}
        </View>
      </ScrollView>
    );
  }

  // --- Móvil ---
  return (
    <GestureHandlerRootView style={styles.screen}>
      <GestureDetector gesture={fling}>
        <ScrollView style={styles.screen} contentContainerStyle={styles.mScroll}>
          <Header />
          {dashboard}
        </ScrollView>
      </GestureDetector>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: PAGE_BG },
  mScroll: { padding: 20, gap: 18, paddingBottom: 40 },
  dScroll: { alignItems: 'center', paddingVertical: 32, paddingHorizontal: 24 },
  dPage: { width: '100%', maxWidth: 720, gap: 18 },

  hero: {
    backgroundColor: BALANCE_GREEN,
    borderRadius: SIZES.radius * 1.6,
    padding: SIZES.padding * 1.4,
  },
  heroLabel: { color: 'rgba(255,255,255,0.82)', fontSize: SIZES.font * 1.1 },
  heroAmount: { color: '#fff', fontSize: SIZES.font * 3, fontWeight: '700', marginTop: 4 },
  heroTrend: { color: 'rgba(255,255,255,0.85)', fontSize: SIZES.font, marginTop: 8 },

  group: { gap: 10 },
  section: { fontSize: SIZES.font * 1.15, color: COLORS.textSecondary },
  row: { flexDirection: 'row', gap: 16 },

  card: {
    flex: 1,
    backgroundColor: CARD_BG,
    borderRadius: SIZES.radius * 1.4,
    paddingVertical: SIZES.padding * 1.2,
    paddingHorizontal: SIZES.padding,
    minHeight: 92,
    justifyContent: 'center',
    gap: 12,
  },
  cardLabel: { fontSize: SIZES.font * 1.1, color: COLORS.darkGray },
  cardValue: { fontSize: SIZES.font * 1.7, fontWeight: '700', color: COLORS.textPrimary },

  track: { height: 10, borderRadius: 5, backgroundColor: TRACK_COLOR, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 5 },
});

export default HomeScreen;
