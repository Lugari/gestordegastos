import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { PieChart, LineChart } from 'react-native-chart-kit';
import { useGetTransactions } from '../hooks/useTransactionData';
import { useGetBudgets } from '../hooks/useBudgetsData';
import { useGetSavings } from '../hooks/useSavingsData';
import { useGetDebts } from '../hooks/useDebtsData';
import { useGetInvestments } from '../hooks/useInvestmentsData';
import { useIsDesktop } from '../hooks/useResponsive';
import { useCurrency } from '../context/CurrencyContext';
import { getDateRange, isWithinRange } from '../utils/dateRange';
import { SIZES } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

// En escritorio acotamos el ancho de los gráficos para que no se deformen.
const MAX_CONTENT_WIDTH = 720;
const PERIODS = ['Mes', 'Año'];

const ReportsScreen = () => {
  const { theme } = useTheme();
  const styles = React.useMemo(() => makeStyles(theme), [theme]);
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const isDesktop = useIsDesktop();

  const [period, setPeriod] = useState('Mes');

  // Ancho disponible para los gráficos (dentro de su tarjeta).
  const contentWidth = Math.min(width, MAX_CONTENT_WIDTH);
  const chartWidth = contentWidth - SIZES.padding * 2 - 24;

  const { data: transactions = [], isLoading: isLoadingTransactions } = useGetTransactions();
  const { data: budgets = [], isLoading: isLoadingBudgets } = useGetBudgets();
  const { data: savings = [] } = useGetSavings();
  const { data: debts = [] } = useGetDebts();
  const { data: investments = [] } = useGetInvestments();

  const { format: money, convert, baseCurrency } = useCurrency();

  // Transacciones del periodo seleccionado.
  const periodTx = useMemo(() => {
    const range = getDateRange(period, null);
    return transactions.filter((t) => isWithinRange(t.date, range));
  }, [transactions, period]);

  // Monto en moneda base de una transacción.
  const toBase = (t) => convert(parseFloat(t.amount) || 0, t.currency || baseCurrency, baseCurrency);

  // Totales del periodo (proximidad: junto a los gráficos).
  const totals = useMemo(() => {
    let inc = 0;
    let exp = 0;
    periodTx.forEach((t) => {
      if (t.type === 'ingreso') inc += toBase(t);
      else if (t.type === 'gasto') exp += toBase(t);
    });
    return { inc, exp, bal: inc - exp };
  }, [periodTx, convert, baseCurrency]);

  // Patrimonio neto: activos (ahorros + inversiones) menos pasivos (deudas).
  const netWorth = useMemo(() => {
    const assets =
      savings.reduce((a, s) => a + (s.used || 0), 0) +
      investments.reduce((a, i) => a + (i.used || 0), 0);
    const liabilities = debts.reduce((a, d) => a + Math.max(0, (d.total || 0) - (d.used || 0)), 0);
    return { assets, liabilities, net: assets - liabilities };
  }, [savings, investments, debts]);

  const expenseData = useMemo(() => {
    if (!periodTx.length || !budgets.length) return [];
    return budgets
      .map((budget) => {
        const total = periodTx
          .filter((t) => t.type === 'gasto' && t.budget_id === budget.id)
          .reduce((sum, t) => sum + toBase(t), 0);
        return {
          name: budget.name,
          // Redondeado: la librería muestra este valor tal cual en la leyenda.
          total: Math.round(total),
          color: budget.color,
          legendFontColor: theme.textPrimary,
          legendFontSize: 13,
        };
      })
      .filter((item) => item.total > 0);
  }, [periodTx, budgets, convert, baseCurrency]);

  const trendData = useMemo(() => {
    if (!periodTx.length) return { labels: [], datasets: [{ data: [] }, { data: [] }] };

    // En 'Año' agrupamos por mes; en 'Mes' por día (legible en ambos casos).
    const keyFn = period === 'Año'
      ? (d) => d.toLocaleDateString('es-CO', { month: 'short' })
      : (d) => d.toLocaleDateString('es-CO', { month: 'short', day: 'numeric' });

    const sorted = [...periodTx].sort((a, b) => new Date(a.date) - new Date(b.date));
    const labels = [...new Set(sorted.map((t) => keyFn(new Date(t.date))))];

    const incomeBy = {};
    const expenseBy = {};
    labels.forEach((l) => { incomeBy[l] = 0; expenseBy[l] = 0; });
    sorted.forEach((t) => {
      const k = keyFn(new Date(t.date));
      if (t.type === 'ingreso') incomeBy[k] += toBase(t);
      else if (t.type === 'gasto') expenseBy[k] += toBase(t);
    });

    return {
      labels,
      datasets: [
        { data: labels.map((l) => incomeBy[l]), color: (o = 1) => `rgba(28, 107, 82, ${o})`, strokeWidth: 2 },
        { data: labels.map((l) => expenseBy[l]), color: (o = 1) => `rgba(192, 86, 62, ${o})`, strokeWidth: 2 },
      ],
      legend: ['Ingresos', 'Egresos'],
    };
  }, [periodTx, period, convert, baseCurrency]);

  if (isLoadingTransactions || isLoadingBudgets) {
    return <Text style={{ padding: SIZES.padding }}>Cargando reportes…</Text>;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={isDesktop && styles.contentDesktop}>
      {/* Encabezado + periodo */}
      <View style={styles.headerRow}>
        <Text style={styles.header}>Reportes</Text>
        <View style={styles.segment}>
          {PERIODS.map((p) => {
            const active = period === p;
            return (
              <TouchableOpacity key={p} style={[styles.segmentItem, active && styles.segmentItemActive]} onPress={() => setPeriod(p)}>
                <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{p}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Totales del periodo */}
      <View style={styles.totalsRow}>
        <View style={[styles.totalChip, { backgroundColor: theme.incomeSoft }]}>
          <Text style={[styles.totalLabel, { color: theme.income }]}>Ingresos</Text>
          <Text style={[styles.totalValue, { color: theme.incomeStrong }]} numberOfLines={1}>{money(totals.inc)}</Text>
        </View>
        <View style={[styles.totalChip, { backgroundColor: theme.expenseSoft }]}>
          <Text style={[styles.totalLabel, { color: theme.expense }]}>Egresos</Text>
          <Text style={[styles.totalValue, { color: theme.expenseStrong }]} numberOfLines={1}>{money(totals.exp)}</Text>
        </View>
        <View style={[styles.totalChip, { backgroundColor: theme.savingSoft }]}>
          <Text style={[styles.totalLabel, { color: theme.saving }]}>Balance</Text>
          <Text style={[styles.totalValue, { color: theme.savingStrong }]} numberOfLines={1}>{money(totals.bal)}</Text>
        </View>
      </View>

      {/* Patrimonio neto (héroe) */}
      <View style={styles.netWorthCard}>
        <Text style={styles.netWorthLabel}>Patrimonio neto</Text>
        <Text style={styles.netWorthValue}>{money(netWorth.net)}</Text>
        <View style={styles.netWorthRow}>
          <Text style={styles.netWorthDetail}>Activos {money(netWorth.assets)}</Text>
          <Text style={styles.netWorthDetail}>Pasivos {money(netWorth.liabilities)}</Text>
        </View>
      </View>

      {/* Distribución de gastos */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Distribución de gastos</Text>
        {expenseData.length > 0 ? (
          <PieChart
            data={expenseData}
            width={chartWidth}
            height={200}
            chartConfig={{ color: (o = 1) => theme.isDark ? `rgba(236,236,228,${o})` : `rgba(0, 0, 0, ${o})` }}
            accessor="total"
            backgroundColor="transparent"
            paddingLeft="10"
            absolute
          />
        ) : (
          <Text style={styles.emptyChart}>No hay gastos en este periodo.</Text>
        )}
      </View>

      {/* Ingresos vs egresos */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Ingresos vs egresos</Text>
        {trendData.labels.length > 0 ? (
          <LineChart
            data={trendData}
            width={chartWidth}
            height={230}
            chartConfig={{
              backgroundColor: theme.card,
              backgroundGradientFrom: theme.card,
              backgroundGradientTo: theme.card,
              decimalPlaces: 0,
              color: (o = 1) => theme.isDark ? `rgba(236,236,228,${o})` : `rgba(0, 0, 0, ${o})`,
              style: { borderRadius: 16 },
            }}
            bezier
          />
        ) : (
          <Text style={styles.emptyChart}>No hay suficientes datos para la tendencia.</Text>
        )}
      </View>

      {/* Acción secundaria */}
      <TouchableOpacity style={styles.customButton} onPress={() => navigation.navigate('ReportBuilderScreen')}>
        <MaterialIcons name="tune" size={20} color={theme.green} />
        <Text style={styles.customButtonText}>Crear reporte personalizado</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const makeStyles = (t) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: t.background,
    padding: SIZES.padding,
  },
  contentDesktop: {
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SIZES.padding,
  },
  header: {
    fontSize: SIZES.font * 1.8,
    fontWeight: '600',
    color: t.textPrimary,
  },
  segment: {
    flexDirection: 'row',
    backgroundColor: t.track,
    borderRadius: 8,
    padding: 3,
  },
  segmentItem: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 6 },
  segmentItemActive: { backgroundColor: t.green },
  segmentText: { fontSize: SIZES.font, color: t.textSecondary, fontWeight: '500' },
  segmentTextActive: { color: '#fff' },

  totalsRow: { flexDirection: 'row', gap: 8, marginBottom: SIZES.padding },
  totalChip: { flex: 1, borderRadius: SIZES.radius, paddingVertical: 8, paddingHorizontal: 10 },
  totalLabel: { fontSize: SIZES.font * 0.8 },
  totalValue: { fontSize: SIZES.font * 1.05, fontWeight: '600', marginTop: 2 },

  netWorthCard: {
    backgroundColor: t.green,
    borderRadius: SIZES.radius * 1.4,
    padding: SIZES.padding,
    marginBottom: SIZES.padding,
  },
  netWorthLabel: { fontSize: SIZES.font, color: 'rgba(255,255,255,0.82)' },
  netWorthValue: { fontSize: SIZES.font * 2.2, fontWeight: '700', color: '#fff', marginVertical: 4 },
  netWorthRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  netWorthDetail: { fontSize: SIZES.font, color: 'rgba(255,255,255,0.85)', fontWeight: '500' },

  card: {
    backgroundColor: t.card,
    borderRadius: SIZES.radius * 1.4,
    padding: 12,
    marginBottom: SIZES.padding,
    alignItems: 'center',
  },
  cardTitle: {
    alignSelf: 'flex-start',
    fontSize: SIZES.font * 1.1,
    fontWeight: '500',
    color: t.textPrimary,
    marginBottom: 8,
  },
  emptyChart: { fontSize: SIZES.font, color: t.textSecondary, paddingVertical: 20 },

  customButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: t.green,
    borderRadius: SIZES.radius * 1.2,
    paddingVertical: SIZES.padding * 0.8,
    marginBottom: SIZES.padding,
  },
  customButtonText: { fontSize: SIZES.font, fontWeight: '600', color: t.green },
});

export default ReportsScreen;
