import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, useWindowDimensions } from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';

import { useGetBudgets } from '../hooks/useBudgetsData';
import { useGetTransactions } from '../hooks/useTransactionData';
import { useGetSavings } from '../hooks/useSavingsData';
import { useGetDebts } from '../hooks/useDebtsData';
import { useGetInvestments } from '../hooks/useInvestmentsData';
import { useIsDesktop } from '../hooks/useResponsive';
import { useCurrency } from '../context/CurrencyContext';
import { useTheme } from '../context/ThemeContext';
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
const BalanceHero = ({ amount, trend, styles }) => (
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
const MetricCard = ({ label, value, onPress, styles }) => (
  <TouchableOpacity style={styles.card} activeOpacity={0.7} onPress={onPress}>
    <Text style={styles.cardLabel}>{label}</Text>
    <Text style={styles.cardValue}>{value}</Text>
  </TouchableOpacity>
);

// Tarjeta plana de objetivo: etiqueta + barra de progreso agregada.
const ProgressCard = ({ label, ratio, color, onPress, styles }) => (
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
  const { width } = useWindowDimensions();
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const { format, convert, currency, baseCurrency } = useCurrency();

  // Ancho de los gráficos (dentro de su tarjeta, acotado en escritorio).
  const chartWidth = Math.min(width, 640) - SIZES.padding * 2 - 24;

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
      if (transaction.type.toLowerCase() === 'ingreso' && !transaction.is_advance) {
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

  // Tarjetas de crédito: la deuda real es `used` (total = cupo); otras deudas usan `total`.
  const totalDebts = useMemo(() => debts.reduce((acc, d) => acc + (d.type === 'credit card' ? (d.used || 0) : (d.total || 0)), 0), [debts]);
  const totalInvestments = useMemo(() => investments.reduce((acc, inv) => acc + (inv.used || 0), 0), [investments]);

  // --- Análisis: tendencia de 6 meses y distribución de gastos del mes ---
  const trendData = useMemo(() => {
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ y: d.getFullYear(), m: d.getMonth(), label: d.toLocaleDateString('es-CO', { month: 'short' }) });
    }
    const income = months.map(() => 0);
    const expense = months.map(() => 0);
    for (const t of transactions) {
      const d = new Date(t.date);
      const idx = months.findIndex((mm) => mm.y === d.getFullYear() && mm.m === d.getMonth());
      if (idx < 0) continue;
      const base = convert(parseFloat(t.amount) || 0, t.currency || baseCurrency, baseCurrency);
      const type = (t.type || '').toLowerCase();
      if (type === 'ingreso' && !t.is_advance) income[idx] += base;
      else if (type === 'gasto') expense[idx] += base;
    }
    const hasData = income.some((v) => v > 0) || expense.some((v) => v > 0);
    return {
      hasData,
      labels: months.map((mm) => mm.label),
      datasets: [
        { data: income.map((v) => Math.round(convert(v))), color: (o = 1) => `rgba(28, 107, 82, ${o})`, strokeWidth: 2 },
        { data: expense.map((v) => Math.round(convert(v))), color: (o = 1) => `rgba(192, 86, 62, ${o})`, strokeWidth: 2 },
      ],
      legend: ['Ingresos', 'Egresos'],
    };
  }, [transactions, convert, baseCurrency]);

  const expenseSlices = useMemo(() => {
    const now = new Date();
    const byCat = {};
    for (const t of transactions) {
      if ((t.type || '').toLowerCase() !== 'gasto') continue;
      const d = new Date(t.date);
      if (d.getFullYear() !== now.getFullYear() || d.getMonth() !== now.getMonth()) continue;
      const bucket = budgets.find((b) => b.id === t.budget_id);
      const key = bucket?.name || 'Otros';
      byCat[key] ??= { name: key, total: 0, color: bucket?.color || '#9a9a90' };
      byCat[key].total += convert(parseFloat(t.amount) || 0, t.currency || baseCurrency, baseCurrency);
    }
    return Object.values(byCat)
      .sort((a, b) => b.total - a.total)
      .map((c) => ({
        name: c.name,
        population: Math.round(convert(c.total)),
        color: c.color,
        legendFontColor: undefined, // se fija al renderizar (tema)
        legendFontSize: 12,
      }));
  }, [transactions, budgets, convert, baseCurrency]);

  const themedSlices = useMemo(
    () => expenseSlices.map((sl) => ({ ...sl, legendFontColor: theme.textPrimary })),
    [expenseSlices, theme],
  );

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
        <BalanceHero amount={format(totalBalance)} trend={trend} styles={styles} />
      </TouchableOpacity>

      <View style={styles.group}>
        <Text style={styles.section}>Este mes</Text>
        <View style={styles.row}>
          <MetricCard styles={styles} label="Ingresos" value={abbreviate(totalIncome)} onPress={() => navigation.navigate('AddTransactionScreen', { transactionType: 'ingreso' })} />
          <MetricCard styles={styles} label="Egresos" value={abbreviate(totalExpenses)} onPress={() => navigation.navigate('AddTransactionScreen', { transactionType: 'gasto' })} />
        </View>
      </View>

      <View style={styles.group}>
        <Text style={styles.section}>Mis objetivos</Text>
        <View style={styles.row}>
          <ProgressCard styles={styles} label="Presupuestos" ratio={budgetRatio} color={BUDGET_COLOR} onPress={() => navigation.navigate('BudgetsScreen')} />
          <ProgressCard styles={styles} label="Ahorros" ratio={savingRatio} color={SAVING_COLOR} onPress={() => navigation.navigate('SavingsScreen')} />
        </View>
      </View>

      <View style={styles.group}>
        <Text style={styles.section}>Patrimonio</Text>
        <View style={styles.row}>
          <MetricCard styles={styles} label="Deudas" value={abbreviate(totalDebts)} onPress={() => navigation.navigate('DebtsScreen')} />
          <MetricCard styles={styles} label="Inversiones" value={abbreviate(totalInvestments)} onPress={() => navigation.navigate('InvestmentsScreen')} />
        </View>
      </View>

      {/* Análisis: aparece al deslizar hacia abajo */}
      <View style={styles.group}>
        <Text style={styles.section}>Análisis</Text>
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Ingresos vs egresos (6 meses)</Text>
          {trendData.hasData ? (
            <LineChart
              data={{ labels: trendData.labels, datasets: trendData.datasets, legend: trendData.legend }}
              width={chartWidth}
              height={200}
              chartConfig={{
                backgroundGradientFrom: theme.card,
                backgroundGradientTo: theme.card,
                decimalPlaces: 0,
                color: (o = 1) => theme.isDark ? `rgba(236,236,228,${o})` : `rgba(0,0,0,${o})`,
              }}
              bezier
            />
          ) : (
            <Text style={styles.chartEmpty}>Registra movimientos para ver tu tendencia.</Text>
          )}
        </View>
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Gastos del mes por categoría</Text>
          {expenseSlices.length > 0 ? (
            <PieChart
              data={themedSlices}
              width={chartWidth}
              height={190}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="10"
              chartConfig={{ color: (o = 1) => theme.isDark ? `rgba(236,236,228,${o})` : `rgba(0,0,0,${o})` }}
              absolute
            />
          ) : (
            <Text style={styles.chartEmpty}>Sin gastos este mes.</Text>
          )}
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

const makeStyles = (t) => StyleSheet.create({
  chartCard: {
    backgroundColor: t.card,
    borderRadius: SIZES.radius * 1.2,
    padding: 12,
    marginBottom: 10,
    overflow: 'hidden',
  },
  chartTitle: { fontSize: SIZES.font * 0.95, fontWeight: '600', color: t.textPrimary, marginBottom: 8 },
  chartEmpty: { fontSize: SIZES.font * 0.9, color: t.textSecondary, paddingVertical: 16 },
  screen: { flex: 1, backgroundColor: t.background },
  mScroll: { padding: 20, gap: 18, paddingBottom: 40 },
  dScroll: { alignItems: 'center', paddingVertical: 32, paddingHorizontal: 24 },
  dPage: { width: '100%', maxWidth: 720, gap: 18 },

  hero: {
    backgroundColor: t.green,
    borderRadius: SIZES.radius * 1.6,
    padding: SIZES.padding * 1.4,
  },
  heroLabel: { color: 'rgba(255,255,255,0.82)', fontSize: SIZES.font * 1.1 },
  heroAmount: { color: '#fff', fontSize: SIZES.font * 3, fontWeight: '700', marginTop: 4 },
  heroTrend: { color: 'rgba(255,255,255,0.85)', fontSize: SIZES.font, marginTop: 8 },

  group: { gap: 10 },
  section: { fontSize: SIZES.font * 1.15, color: t.textSecondary },
  row: { flexDirection: 'row', gap: 16 },

  card: {
    flex: 1,
    backgroundColor: t.cardAlt,
    borderRadius: SIZES.radius * 1.4,
    paddingVertical: SIZES.padding * 1.2,
    paddingHorizontal: SIZES.padding,
    minHeight: 92,
    justifyContent: 'center',
    gap: 12,
  },
  cardLabel: { fontSize: SIZES.font * 1.1, color: t.textSecondary },
  cardValue: { fontSize: SIZES.font * 1.7, fontWeight: '700', color: t.textPrimary },

  track: { height: 10, borderRadius: 5, backgroundColor: t.track, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 5 },
});

export default HomeScreen;
