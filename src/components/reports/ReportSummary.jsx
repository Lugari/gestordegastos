import React, { View, Text, StyleSheet } from 'react-native';
import { PieChart } from 'react-native-chart-kit';

import { SIZES } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { useCurrency } from '../../context/CurrencyContext';


// KPI como chip de color (mismo lenguaje que Historial/Reportes).
const KpiChip = ({ label, value, bg, labelColor, valueColor, styles }) => (
  <View style={[styles.kpi, { backgroundColor: bg }]}>
    <Text style={[styles.kpiLabel, { color: labelColor }]}>{label}</Text>
    <Text style={[styles.kpiValue, { color: valueColor }]} numberOfLines={1} adjustsFontSizeToFit>
      {value}
    </Text>
  </View>
);

// Barra comparativa horizontal simple (sin dependencias de gráficos).
const CompareBar = ({ label, value, valueText, max, color, styles }) => {
  const pct = max > 0 ? Math.min(1, value / max) : 0;
  return (
    <View style={styles.compareRow}>
      <Text style={styles.compareLabel}>{label}</Text>
      <View style={styles.compareTrack}>
        <View style={[styles.compareFill, { width: `${pct * 100}%`, backgroundColor: color }]} />
      </View>
      <Text style={[styles.compareValue, { color }]}>{valueText}</Text>
    </View>
  );
};

// Vista "Simple": resumen rápido con comparativo y distribución de gastos.
const ReportSummary = ({ report, chartWidth }) => {
  const { theme } = useTheme();
  const styles = React.useMemo(() => makeStyles(theme), [theme]);
  const INCOME = theme.green, EXPENSE = theme.expense, SAVING = theme.saving;
  const { format } = useCurrency();
  const { totalIncome, totalExpense, totalSavings, net, byCategory, count } = report;

  const expenseSlices = byCategory
    .filter((c) => c.type === 'gasto' && c.total > 0)
    .map((c) => ({
      name: c.name,
      population: Math.round(c.total),
      color: c.color || theme.danger,
      legendFontColor: theme.textPrimary,
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
        <KpiChip styles={styles} label="Ingresos" value={format(totalIncome)} bg={theme.incomeSoft} labelColor={theme.income} valueColor={theme.incomeStrong} />
        <KpiChip styles={styles} label="Gastos" value={format(totalExpense)} bg={theme.expenseSoft} labelColor={theme.expense} valueColor={theme.expenseStrong} />
        <KpiChip styles={styles} label="Neto" value={format(net)} bg={theme.savingSoft} labelColor={theme.saving} valueColor={theme.savingStrong} />
      </View>

      {/* Comparativo Ingresos vs Gastos */}
      <View style={styles.block}>
        <Text style={styles.blockTitle}>Ingresos vs gastos</Text>
        <CompareBar styles={styles} label="Ingresos" value={totalIncome} valueText={format(totalIncome)} max={max} color={INCOME} />
        <CompareBar styles={styles} label="Gastos" value={totalExpense} valueText={format(totalExpense)} max={max} color={EXPENSE} />
        {totalSavings > 0 && <CompareBar styles={styles} label="Ahorros" value={totalSavings} valueText={format(totalSavings)} max={max} color={SAVING} />}
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
            chartConfig={{ color: (opacity = 1) => theme.isDark ? `rgba(236,236,228,${opacity})` : `rgba(0,0,0,${opacity})` }}
            absolute
          />
        ) : (
          <Text style={styles.empty}>Sin gastos en este periodo.</Text>
        )}
      </View>
    </View>
  );
};

const makeStyles = (t) => StyleSheet.create({
  kpiRow: { flexDirection: 'row', gap: 8 },
  kpi: { flex: 1, borderRadius: SIZES.radius, padding: SIZES.padding * 0.6 },
  kpiLabel: { fontSize: SIZES.font * 0.8, fontWeight: '600' },
  kpiValue: { fontSize: SIZES.font * 1.2, fontWeight: '700', marginTop: 4 },
  block: { marginTop: SIZES.padding * 1.5 },
  blockTitle: {
    fontSize: SIZES.font * 1.1,
    fontWeight: '500',
    color: t.textPrimary,
    marginBottom: SIZES.base,
  },
  compareRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 5 },
  compareLabel: { width: 70, fontSize: SIZES.font * 0.9, color: t.textSecondary, fontWeight: '600' },
  compareTrack: { flex: 1, height: 14, borderRadius: 7, backgroundColor: t.track, overflow: 'hidden' },
  compareFill: { height: '100%', borderRadius: 7 },
  compareValue: { width: 100, textAlign: 'right', fontSize: SIZES.font * 0.9, fontWeight: 'bold' },
  empty: { fontSize: SIZES.font, color: t.textSecondary, marginTop: SIZES.padding },
});

export default ReportSummary;
