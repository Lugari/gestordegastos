import { View, Text, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

import { COLORS, SIZES } from '../../constants/theme';
import { TX_TYPES } from '../../constants/reportTypes';

const money = (n) => (n < 0 ? '-$' : '$') + Math.abs(Math.round(n)).toLocaleString('es-CO');
const typeColor = (t) => TX_TYPES.find((x) => x.value === t)?.color || COLORS.neutral;
const formatDate = (d) => new Date(d).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });

// Vista "Detallado": tendencia, desglose por categoría y lista de movimientos.
const ReportDetailed = ({ report, chartWidth }) => {
  const { totalIncome, totalExpense, totalSavings, net, byCategory, timeSeries, transactions, count } = report;

  if (count === 0) {
    return <Text style={styles.empty}>No hay transacciones para los filtros seleccionados.</Text>;
  }

  const hasTrend = timeSeries.labels.length >= 2;
  const grandTotal = byCategory.reduce((a, c) => a + c.total, 0) || 1;

  return (
    <View>
      {/* Totales por tipo */}
      <View style={styles.totalsCard}>
        <View style={styles.totalRow}><Text style={styles.totalLabel}>Ingresos</Text><Text style={[styles.totalVal, { color: COLORS.success }]}>{money(totalIncome)}</Text></View>
        <View style={styles.totalRow}><Text style={styles.totalLabel}>Gastos</Text><Text style={[styles.totalVal, { color: COLORS.danger }]}>{money(totalExpense)}</Text></View>
        <View style={styles.totalRow}><Text style={styles.totalLabel}>Ahorros</Text><Text style={[styles.totalVal, { color: COLORS.primary }]}>{money(totalSavings)}</Text></View>
        <View style={[styles.totalRow, styles.totalNet]}><Text style={styles.totalLabelBold}>Neto</Text><Text style={[styles.totalVal, { color: net >= 0 ? COLORS.success : COLORS.danger, fontSize: SIZES.font * 1.3 }]}>{money(net)}</Text></View>
      </View>

      {/* Tendencia ingresos vs egresos */}
      {hasTrend && (
        <View style={styles.block}>
          <Text style={styles.blockTitle}>Tendencia ingresos vs. egresos</Text>
          <LineChart
            data={{
              labels: timeSeries.labels,
              datasets: [
                { data: timeSeries.income, color: (o = 1) => `rgba(74, 209, 74, ${o})`, strokeWidth: 2 },
                { data: timeSeries.expense, color: (o = 1) => `rgba(215, 106, 97, ${o})`, strokeWidth: 2 },
              ],
              legend: ['Ingresos', 'Egresos'],
            }}
            width={chartWidth}
            height={220}
            chartConfig={{
              backgroundGradientFrom: COLORS.background,
              backgroundGradientTo: COLORS.background,
              decimalPlaces: 0,
              color: (o = 1) => `rgba(0,0,0,${o})`,
            }}
            bezier
          />
        </View>
      )}

      {/* Desglose por categoría */}
      <View style={styles.block}>
        <Text style={styles.blockTitle}>Desglose por categoría</Text>
        {byCategory.map((c) => {
          const pct = Math.round((c.total / grandTotal) * 100);
          return (
            <View key={c.id} style={styles.catRow}>
              <View style={styles.catHeader}>
                <Text style={styles.catName}>{c.name}</Text>
                <Text style={styles.catAmount}>{money(c.total)} · {pct}%</Text>
              </View>
              <View style={styles.catTrack}>
                <View style={[styles.catFill, { width: `${pct}%`, backgroundColor: c.color || COLORS.neutral }]} />
              </View>
              <Text style={styles.catMeta}>{c.count} movimiento{c.count !== 1 ? 's' : ''}</Text>
            </View>
          );
        })}
      </View>

      {/* Lista de movimientos */}
      <View style={styles.block}>
        <Text style={styles.blockTitle}>Movimientos ({count})</Text>
        {transactions.map((t) => (
          <View key={t.id} style={styles.txRow}>
            <View style={[styles.txDot, { backgroundColor: typeColor(t.type) }]} />
            <Text style={styles.txDate}>{formatDate(t.date)}</Text>
            <Text style={styles.txNote} numberOfLines={1}>{t.notes || t.type}</Text>
            <Text style={[styles.txAmount, { color: typeColor(t.type) }]}>
              {t.type === 'gasto' ? '-' : '+'}{money(parseFloat(t.amount) || 0)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  totalsCard: {
    backgroundColor: '#fff',
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  totalNet: {
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    marginTop: 4,
    paddingTop: 8,
  },
  totalLabel: { fontSize: SIZES.font, color: COLORS.textSecondary },
  totalLabelBold: { fontSize: SIZES.font, color: COLORS.textPrimary, fontWeight: 'bold' },
  totalVal: { fontSize: SIZES.font, fontWeight: 'bold' },
  block: { marginTop: SIZES.padding * 1.5 },
  blockTitle: {
    fontSize: SIZES.font * 1.1,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SIZES.base,
  },
  catRow: { marginVertical: 6 },
  catHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  catName: { fontSize: SIZES.font, color: COLORS.textPrimary, fontWeight: '600' },
  catAmount: { fontSize: SIZES.font * 0.9, color: COLORS.textSecondary, fontWeight: 'bold' },
  catTrack: {
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.lightGray,
    overflow: 'hidden',
    marginTop: 4,
  },
  catFill: { height: '100%', borderRadius: 5 },
  catMeta: { fontSize: SIZES.font * 0.8, color: COLORS.neutral, marginTop: 2 },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  txDot: { width: 8, height: 8, borderRadius: 4 },
  txDate: { width: 56, fontSize: SIZES.font * 0.85, color: COLORS.textSecondary },
  txNote: { flex: 1, fontSize: SIZES.font * 0.9, color: COLORS.textPrimary },
  txAmount: { fontSize: SIZES.font * 0.95, fontWeight: 'bold' },
  empty: { fontSize: SIZES.font, color: COLORS.textSecondary, marginTop: SIZES.padding },
});

export default ReportDetailed;
