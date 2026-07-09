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
      if (transaction.type.toLowerCase() === 'ingreso' && !transaction.is_advance && !transaction.is_investment_flow) {
        currentIncome += amount;
      } else if (transaction.type.toLowerCase() === 'gasto' && !transaction.is_investment_flow) {
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
  // Valor de mercado de la inversión (o capital si nunca se revaluó).
  const totalInvestments = useMemo(() => investments.reduce((acc, inv) => acc + (inv.current_value != null ? Number(inv.current_value) || 0 : inv.used || 0), 0), [investments]);

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
      if (type === 'ingreso' && !t.is_advance && !t.is_investment_flow) income[idx] += base;
      else if (type === 'gasto' && !t.is_investment_flow) expense[idx] += base;
    }
    const hasData = income.some((v) => v > 0) || expense.some((v) => v > 0);
    return {
      hasData,
      incomeRaw: income,
      expenseRaw: expense,
      labels: months.map((mm) => mm.label),
      datasets: [
        { data: income.map((v) => Math.round(convert(v))), color: (o = 1) => `rgba(28, 107, 82, ${o})`, strokeWidth: 3 },
        { data: expense.map((v) => Math.round(convert(v))), color: (o = 1) => `rgba(192, 86, 62, ${o})`, strokeWidth: 3 },
      ],
      legend: ['Ingresos', 'Egresos'],
    };
  }, [transactions, convert, baseCurrency]);

  // Total ahorrado (dinero apartado en metas) para el patrimonio.
  const totalSavings = useMemo(() => savings.reduce((a, s) => a + (s.used || 0), 0), [savings]);

  // Estadísticas de los últimos 6 meses (promedios, tasa de ahorro, peor mes).
  const analytics = useMemo(() => {
    const inc = trendData.incomeRaw || [];
    const exp = trendData.expenseRaw || [];
    const n = inc.length || 1;
    const sumInc = inc.reduce((a, b) => a + b, 0);
    const sumExp = exp.reduce((a, b) => a + b, 0);
    let worstIdx = 0;
    exp.forEach((v, i) => { if (v > exp[worstIdx]) worstIdx = i; });
    return {
      avgExpense: sumExp / n,
      avgIncome: sumInc / n,
      savingsRate: sumInc > 0 ? ((sumInc - sumExp) / sumInc) * 100 : null,
      worstMonth: exp[worstIdx] > 0 ? trendData.labels?.[worstIdx] : null,
      worstValue: exp[worstIdx] || 0,
    };
  }, [trendData]);

  // Composición del patrimonio: activos (ahorros + inversiones) vs deudas.
  const patrimonio = useMemo(() => {
    const assets = totalSavings + totalInvestments;
    const net = assets - totalDebts;
    const max = Math.max(assets, totalDebts, 1);
    return { assets, net, max, savings: totalSavings, investments: totalInvestments, debts: totalDebts };
  }, [totalSavings, totalInvestments, totalDebts]);

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
        population: Math.round(c.total), // en moneda base (abbreviate la convierte)
        color: c.color,
      }));
  }, [transactions, budgets, convert, baseCurrency]);

  // Top 6 categorías + "Otros"; con total y porcentaje para la leyenda.
  const categoryData = useMemo(() => {
    const total = expenseSlices.reduce((a, s) => a + s.population, 0);
    if (total <= 0) return { total: 0, slices: [], legend: [] };
    const top = expenseSlices.slice(0, 6);
    const restTotal = expenseSlices.slice(6).reduce((a, s) => a + s.population, 0);
    const slices = [...top];
    if (restTotal > 0) slices.push({ name: 'Otros', population: restTotal, color: '#9a9a90' });
    const legend = slices.map((s) => ({ ...s, pct: Math.round((s.population / total) * 100) }));
    return { total, slices, legend };
  }, [expenseSlices]);

  const themedSlices = useMemo(
    () => categoryData.slices.map((sl) => ({ ...sl, legendFontColor: 'transparent', legendFontSize: 1 })),
    [categoryData],
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

        {/* Estadísticas rápidas de los últimos 6 meses */}
        <View style={styles.statRow}>
          <View style={styles.statChip}>
            <Text style={[styles.statValue, { color: theme.green }]}>{analytics.savingsRate != null ? `${Math.round(analytics.savingsRate)}%` : '—'}</Text>
            <Text style={styles.statLabel}>Tasa de ahorro</Text>
          </View>
          <View style={styles.statChip}>
            <Text style={styles.statValue}>{abbreviate(analytics.avgExpense)}</Text>
            <Text style={styles.statLabel}>Gasto prom./mes</Text>
          </View>
          <View style={styles.statChip}>
            <Text style={styles.statValue}>{abbreviate(analytics.avgIncome)}</Text>
            <Text style={styles.statLabel}>Ingreso prom./mes</Text>
          </View>
        </View>

        {/* Ingresos vs egresos (línea con relleno) */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Ingresos vs egresos (6 meses)</Text>
          {trendData.hasData ? (
            <LineChart
              data={{ labels: trendData.labels, datasets: trendData.datasets, legend: trendData.legend }}
              width={chartWidth}
              height={210}
              withInnerLines={false}
              withOuterLines={false}
              fromZero
              segments={4}
              chartConfig={{
                backgroundGradientFrom: theme.card,
                backgroundGradientTo: theme.card,
                fillShadowGradientOpacity: 0.15,
                decimalPlaces: 0,
                color: (o = 1) => theme.isDark ? `rgba(169,180,173,${o})` : `rgba(79,96,87,${o})`,
                labelColor: (o = 1) => theme.isDark ? `rgba(169,180,173,${o})` : `rgba(79,96,87,${o})`,
                propsForDots: { r: '4', strokeWidth: '2', stroke: theme.card },
                propsForBackgroundLines: { stroke: theme.border },
              }}
              bezier
              style={styles.chartInner}
            />
          ) : (
            <Text style={styles.chartEmpty}>Registra movimientos para ver tu tendencia.</Text>
          )}
          {analytics.worstMonth ? (
            <Text style={styles.chartFootnote}>Mes de mayor gasto: {analytics.worstMonth} · {abbreviate(analytics.worstValue)}</Text>
          ) : null}
        </View>

        {/* Composición del patrimonio: activos vs deudas */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Composición del patrimonio</Text>
          <Text style={[styles.netValue, { color: patrimonio.net >= 0 ? theme.green : theme.expense }]}>{format(patrimonio.net)}</Text>
          <Text style={styles.netLabel}>Patrimonio neto</Text>

          <View style={styles.compRow}>
            <Text style={styles.compTag}>Activos</Text>
            <View style={styles.compTrack}>
              {patrimonio.savings > 0 ? <View style={{ flex: patrimonio.savings, backgroundColor: SAVING_COLOR }} /> : null}
              {patrimonio.investments > 0 ? <View style={{ flex: patrimonio.investments, backgroundColor: '#8367C7' }} /> : null}
              <View style={{ flex: Math.max(0.0001, patrimonio.max - patrimonio.assets) }} />
            </View>
          </View>
          <View style={styles.compRow}>
            <Text style={styles.compTag}>Deudas</Text>
            <View style={styles.compTrack}>
              {patrimonio.debts > 0 ? <View style={{ flex: patrimonio.debts, backgroundColor: theme.expense }} /> : null}
              <View style={{ flex: Math.max(0.0001, patrimonio.max - patrimonio.debts) }} />
            </View>
          </View>

          <View style={styles.compLegend}>
            <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: SAVING_COLOR }]} /><Text style={styles.legendText}>Ahorros {abbreviate(patrimonio.savings)}</Text></View>
            <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#8367C7' }]} /><Text style={styles.legendText}>Inversiones {abbreviate(patrimonio.investments)}</Text></View>
            <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: theme.expense }]} /><Text style={styles.legendText}>Deudas {abbreviate(patrimonio.debts)}</Text></View>
          </View>
        </View>

        {/* Gastos del mes por categoría (dona + leyenda con %) */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Gastos del mes por categoría</Text>
          {categoryData.slices.length > 0 ? (
            <View style={styles.pieRow}>
              <PieChart
                data={themedSlices}
                width={150}
                height={150}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="35"
                hasLegend={false}
                center={[0, 0]}
                chartConfig={{ color: (o = 1) => theme.isDark ? `rgba(236,236,228,${o})` : `rgba(0,0,0,${o})` }}
              />
              <View style={styles.catLegend}>
                {categoryData.legend.map((c) => (
                  <View key={c.name} style={styles.catRow}>
                    <View style={[styles.legendDot, { backgroundColor: c.color }]} />
                    <Text style={styles.catName} numberOfLines={1}>{c.name}</Text>
                    <Text style={styles.catPct}>{c.pct}%</Text>
                  </View>
                ))}
              </View>
            </View>
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
  chartInner: { marginLeft: -8, borderRadius: 12 },
  chartEmpty: { fontSize: SIZES.font * 0.9, color: t.textSecondary, paddingVertical: 16 },
  chartFootnote: { fontSize: SIZES.font * 0.78, color: t.textSecondary, marginTop: 6, textAlign: 'center' },

  // Chips de estadísticas
  statRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  statChip: { flex: 1, backgroundColor: t.card, borderRadius: SIZES.radius, paddingVertical: 12, paddingHorizontal: 8, alignItems: 'center' },
  statValue: { fontSize: SIZES.font * 1.15, fontWeight: '800', color: t.textPrimary },
  statLabel: { fontSize: SIZES.font * 0.72, color: t.textSecondary, marginTop: 3, textAlign: 'center' },

  // Composición del patrimonio
  netValue: { fontSize: SIZES.font * 1.8, fontWeight: '800' },
  netLabel: { fontSize: SIZES.font * 0.8, color: t.textSecondary, marginBottom: 12 },
  compRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  compTag: { width: 56, fontSize: SIZES.font * 0.78, color: t.textSecondary },
  compTrack: { flex: 1, height: 14, borderRadius: 7, backgroundColor: t.track, overflow: 'hidden', flexDirection: 'row' },
  compLegend: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 6 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: SIZES.font * 0.78, color: t.textSecondary },

  // Leyenda de categorías (dona)
  pieRow: { flexDirection: 'row', alignItems: 'center' },
  catLegend: { flex: 1, gap: 7, paddingLeft: 4 },
  catRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  catName: { flex: 1, fontSize: SIZES.font * 0.82, color: t.textPrimary },
  catPct: { fontSize: SIZES.font * 0.82, fontWeight: '700', color: t.textSecondary },
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
