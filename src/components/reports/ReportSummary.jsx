import { View, Text, StyleSheet } from 'react-native';
import { PieChart } from 'react-native-chart-kit';

import { COLORS, SIZES } from '../../constants/theme';
import { money } from '../../utils/formatMoney';

const KpiCard = ({ label, value, color }) => (
  <View style={styles.kpi}>
    <Text style={styles.kpiLabel}>{label}</Text>
    <Text style={[styles.kpiValue, { color }]} numberOfLines={1} adjustsFontSizeToFit>
      {money(value)}
    </Text>
  </View>
);

// Barra comparativa horizontal simple (sin dependencias de gráficos).
const CompareBar = ({ label, value, max, color }) => {
  const pct = max > 0 ? Math.min(1, value / max) : 0;
  return (
    <View style={styles.compareRow}>
      <Text style={styles.compareLabel}>{label}</Text>
      <View style={styles.compareTrack}>
        <View style={[styles.compareFill, { width: `${pct * 100}%`, backgroundColor: color }]} />
      </View>
      <Text style={[styles.compareValue, { color }]}>{money(value)}</Text>
    </View>
  );
};

// Vista "Simple": resumen rápido con comparativo y distribución de gastos.
const ReportSummary = ({ report, chartWidth }) => {
  const { totalIncome, totalExpense, totalSavings, net, byCategory, count } = report;

  const expenseSlices = byCategory
    .filter((c) => c.type === 'gasto' && c.total > 0)
    .map((c) => ({
      name: c.name,
      population: c.total,
      color: c.color || COLORS.danger,
      legendFontColor: COLORS.textPrimary,
      legendFontSize: 12,
    }));

  const max = Math.max(totalIncome, totalExpense, 1);

  if (count === 0) {
    return <Text style={styles.empty}>No hay transacciones para los filtros seleccionados.</Text>;
  }

  return (
    <View>
      {/* KPIs */}
      <View style={styles.kpiRow}>
        <KpiCard label="INGRESOS" value={totalIncome} color={COLORS.success} />
        <KpiCard label="GASTOS" value={totalExpense} color={COLORS.danger} />
        <KpiCard label="NETO" value={net} color={net >= 0 ? COLORS.success : COLORS.danger} />
      </View>

      {/* Comparativo Ingresos vs Gastos */}
      <View style={styles.block}>
        <Text style={styles.blockTitle}>Ingresos vs Gastos</Text>
        <CompareBar label="Ingresos" value={totalIncome} max={max} color={COLORS.success} />
        <CompareBar label="Gastos" value={totalExpense} max={max} color={COLORS.danger} />
        {totalSavings > 0 && <CompareBar label="Ahorros" value={totalSavings} max={max} color={COLORS.primary} />}
      </View>

      {/* Distribución de gastos */}
      <View style={styles.block}>
        <Text style={styles.blockTitle}>Distribución de gastos</Text>
        {expenseSlices.length > 0 ? (
          <PieChart
            data={expenseSlices}
            width={chartWidth}
            height={200}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="10"
            chartConfig={{ color: (opacity = 1) => `rgba(0,0,0,${opacity})` }}
            absolute
          />
        ) : (
          <Text style={styles.empty}>Sin gastos en este periodo.</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  kpiRow: {
    flexDirection: 'row',
    gap: 10,
  },
  kpi: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: SIZES.radius,
    padding: SIZES.padding * 0.75,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  kpiLabel: {
    fontSize: SIZES.font * 0.8,
    color: COLORS.neutral,
    fontWeight: 'bold',
  },
  kpiValue: {
    fontSize: SIZES.font * 1.3,
    fontWeight: 'bold',
    marginTop: 4,
  },
  block: {
    marginTop: SIZES.padding * 1.5,
  },
  blockTitle: {
    fontSize: SIZES.font * 1.1,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SIZES.base,
  },
  compareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 5,
  },
  compareLabel: {
    width: 70,
    fontSize: SIZES.font * 0.9,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  compareTrack: {
    flex: 1,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.lightGray,
    overflow: 'hidden',
  },
  compareFill: {
    height: '100%',
    borderRadius: 7,
  },
  compareValue: {
    width: 100,
    textAlign: 'right',
    fontSize: SIZES.font * 0.9,
    fontWeight: 'bold',
  },
  empty: {
    fontSize: SIZES.font,
    color: COLORS.textSecondary,
    marginTop: SIZES.padding,
  },
});

export default ReportSummary;
