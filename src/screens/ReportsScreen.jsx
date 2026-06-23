import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import { PieChart, LineChart } from 'react-native-chart-kit';
import { useGetTransactions } from '../hooks/useTransactionData';
import { useGetBudgets } from '../hooks/useBudgetsData';
import { useIsDesktop } from '../hooks/useResponsive';
import { COLORS, SIZES } from '../constants/theme';

// En escritorio acotamos el ancho de los gráficos para que no se deformen.
const MAX_CONTENT_WIDTH = 720;

const ReportsScreen = () => {
  const { width } = useWindowDimensions();
  const isDesktop = useIsDesktop();

  // Ancho disponible para los gráficos, acotado en escritorio.
  const contentWidth = Math.min(width, MAX_CONTENT_WIDTH);
  const chartWidth = contentWidth - SIZES.padding * 2;

  const { data: transactions = [], isLoading: isLoadingTransactions } = useGetTransactions();
  const { data: budgets = [], isLoading: isLoadingBudgets } = useGetBudgets();

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
