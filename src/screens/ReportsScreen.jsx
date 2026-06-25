import React, { useMemo } from 'react';
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
import { COLORS, SIZES } from '../constants/theme';

// En escritorio acotamos el ancho de los gráficos para que no se deformen.
const MAX_CONTENT_WIDTH = 720;

const ReportsScreen = () => {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const isDesktop = useIsDesktop();

  // Ancho disponible para los gráficos, acotado en escritorio.
  const contentWidth = Math.min(width, MAX_CONTENT_WIDTH);
  const chartWidth = contentWidth - SIZES.padding * 2;

  const { data: transactions = [], isLoading: isLoadingTransactions } = useGetTransactions();
  const { data: budgets = [], isLoading: isLoadingBudgets } = useGetBudgets();
  const { data: savings = [] } = useGetSavings();
  const { data: debts = [] } = useGetDebts();
  const { data: investments = [] } = useGetInvestments();

  // Patrimonio neto: activos (ahorros + inversiones) menos pasivos (deudas).
  const netWorth = useMemo(() => {
    const assets =
      savings.reduce((a, s) => a + (s.used || 0), 0) +
      investments.reduce((a, i) => a + (i.used || 0), 0);
    const liabilities = debts.reduce((a, d) => a + Math.max(0, (d.total || 0) - (d.used || 0)), 0);
    return { assets, liabilities, net: assets - liabilities };
  }, [savings, investments, debts]);

  const money = (n) => (n < 0 ? '-$' : '$') + Math.abs(n).toLocaleString('es-CO');

  const expenseData = useMemo(() => {
    if (!transactions.length || !budgets.length) {
      return [];
    }

    const expenseByCategory = budgets.map(budget => {
      const total = transactions
        .filter(t => t.type === 'gasto' && t.budget_id === budget.id)
        .reduce((sum, t) => sum + t.amount, 0);
      
      return {
        name: budget.name,
        total,
        color: budget.color,
        legendFontColor: COLORS.textPrimary,
        legendFontSize: 15,
      };
    }).filter(item => item.total > 0);

    return expenseByCategory;
  }, [transactions, budgets]);

  const trendData = useMemo(() => {
    if (!transactions.length) {
      return {
        labels: [],
        datasets: [{ data: [] }, { data: [] }],
      };
    }

    const sortedTransactions = transactions.sort((a, b) => new Date(a.date) - new Date(b.date));
    const labels = [...new Set(sortedTransactions.map(t => new Date(t.date).toLocaleDateString('es-CO', { month: 'short', day: 'numeric' })))];
    
    const incomeByDate = {};
    const expenseByDate = {};

    labels.forEach(label => {
        incomeByDate[label] = 0;
        expenseByDate[label] = 0;
    });

    sortedTransactions.forEach(t => {
      const date = new Date(t.date).toLocaleDateString('es-CO', { month: 'short', day: 'numeric' });
      if (t.type === 'ingreso') {
        incomeByDate[date] += t.amount;
      } else if (t.type === 'gasto') {
        expenseByDate[date] += t.amount;
      }
    });

    return {
      labels,
      datasets: [
        {
          data: labels.map(label => incomeByDate[label]),
          color: (opacity = 1) => `rgba(74, 209, 74, ${opacity})`, // Green for income
          strokeWidth: 2,
        },
        {
          data: labels.map(label => expenseByDate[label]),
          color: (opacity = 1) => `rgba(215, 106, 97, ${opacity})`, // Red for expenses
          strokeWidth: 2,
        },
      ],
      legend: ['Ingresos', 'Egresos'],
    };
  }, [transactions]);

  if (isLoadingTransactions || isLoadingBudgets) {
    return <Text>Loading reports...</Text>;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={isDesktop && styles.contentDesktop}>
      <Text style={styles.header}>Reportes</Text>

      <TouchableOpacity style={styles.customButton} onPress={() => navigation.navigate('ReportBuilderScreen')}>
        <MaterialIcons name="tune" size={20} color={COLORS.textPrimary} />
        <Text style={styles.customButtonText}>Reporte personalizado</Text>
      </TouchableOpacity>

      <View style={styles.netWorthCard}>
        <Text style={styles.netWorthLabel}>PATRIMONIO NETO</Text>
        <Text style={[styles.netWorthValue, { color: netWorth.net >= 0 ? COLORS.success : COLORS.danger }]}>
          {money(netWorth.net)}
        </Text>
        <View style={styles.netWorthRow}>
          <Text style={styles.netWorthDetail}>Activos: <Text style={{ color: COLORS.success }}>{money(netWorth.assets)}</Text></Text>
          <Text style={styles.netWorthDetail}>Pasivos: <Text style={{ color: COLORS.danger }}>{money(netWorth.liabilities)}</Text></Text>
        </View>
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Distribución de Gastos</Text>
        {expenseData.length > 0 ? (
          <PieChart
            data={expenseData}
            width={chartWidth}
            height={220}
            chartConfig={{
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            accessor="total"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        ) : (
          <Text>No hay datos de gastos para mostrar.</Text>
        )}
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Tendencia de Ingresos vs. Egresos</Text>
        {trendData.labels.length > 0 ? (
          <LineChart
            data={trendData}
            width={chartWidth}
            height={250}
            chartConfig={{
              backgroundColor: COLORS.background,
              backgroundGradientFrom: COLORS.background,
              backgroundGradientTo: COLORS.background,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16,
              },
            }}
            bezier
          />
        ) : (
          <Text>No hay suficientes datos para mostrar la tendencia.</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SIZES.padding,
  },
  contentDesktop: {
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
  },
  header: {
    fontSize: SIZES.font * 2,
    fontWeight: 'bold',
    marginBottom: SIZES.padding,
  },
  customButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
    paddingVertical: SIZES.padding * 0.75,
    marginBottom: SIZES.padding * 1.5,
  },
  customButtonText: {
    fontSize: SIZES.font,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  netWorthCard: {
    backgroundColor: '#fff',
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: SIZES.padding * 1.5,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  netWorthLabel: {
    fontSize: SIZES.font,
    color: COLORS.neutral,
    fontWeight: 'bold',
  },
  netWorthValue: {
    fontSize: SIZES.font * 2.4,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  netWorthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  netWorthDetail: {
    fontSize: SIZES.font,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  chartContainer: {
    marginBottom: SIZES.padding * 2,
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: SIZES.font * 1.2,
    fontWeight: '600',
    marginBottom: SIZES.padding,
  },
});

export default ReportsScreen;
