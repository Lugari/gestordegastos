import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { SIZES } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { useCurrency } from '../../context/CurrencyContext';


const Row = ({ label, valueText, color, bold, styles }) => (
  <View style={[styles.row, bold && styles.rowBold]}>
    <Text style={[styles.rowLabel, bold && styles.rowLabelBold]}>{label}</Text>
    <Text style={[styles.rowValue, color && { color }, bold && { fontSize: SIZES.font * 1.3 }]}>{valueText}</Text>
  </View>
);

// Vista de la plantilla "Freelancer": apoyo para declaración de impuestos.
const FreelancerReport = ({ summary, expenseCategories, deductibleIds, taxRate, onToggleDeductible, onChangeRate }) => {
  const { theme } = useTheme();
  const styles = React.useMemo(() => makeStyles(theme), [theme]);
  const INCOME = theme.income, EXPENSE = theme.expense;
  const { format } = useCurrency();
  const { grossIncome, deductibleTotal, taxableBase, tax, afterTax, count } = summary;
  const deductibleSet = new Set(deductibleIds);

  if (count === 0) {
    return <Text style={styles.empty}>No hay transacciones para los filtros seleccionados.</Text>;
  }

  return (
    <View>
      {/* Resumen fiscal */}
      <View style={styles.card}>
        <Row styles={styles} label="Ingreso bruto" valueText={format(grossIncome)} color={INCOME} />
        <Row styles={styles} label="Gastos deducibles" valueText={format(deductibleTotal)} color={EXPENSE} />
        <Row styles={styles} label="Base gravable" valueText={format(taxableBase)} bold />

        <View style={styles.rateRow}>
          <Text style={styles.rowLabel}>Tasa de impuesto</Text>
          <View style={styles.rateInputWrap}>
            <TextInput
              style={styles.rateInput}
              value={String(taxRate)}
              onChangeText={(t) => onChangeRate(t.replace(/[^0-9.]/g, ''))}
              keyboardType="numeric"
              placeholder="0"
            />
            <Text style={styles.ratePct}>%</Text>
          </View>
        </View>

        <Row styles={styles} label="Impuesto estimado" valueText={format(tax)} color={EXPENSE} />
        <Row styles={styles} label="Después de impuestos" valueText={format(afterTax)} bold color={afterTax >= 0 ? INCOME : EXPENSE} />
      </View>

      {/* Selección de gastos deducibles */}
      <Text style={styles.blockTitle}>Gastos deducibles</Text>
      <Text style={styles.hint}>Marca las categorías de gasto que puedes deducir.</Text>
      {expenseCategories.length === 0 ? (
        <Text style={styles.empty}>No hay gastos en este periodo.</Text>
      ) : (
        expenseCategories.map((c) => {
          const on = deductibleSet.has(c.id);
          return (
            <TouchableOpacity key={c.id} style={styles.catRow} onPress={() => onToggleDeductible(c.id)}>
              <MaterialCheck on={on} t={theme} />
              <Text style={styles.catName}>{c.name}</Text>
              <Text style={styles.catTotal}>{format(c.total)}</Text>
            </TouchableOpacity>
          );
        })
      )}
    </View>
  );
};

// Checkbox con el verde de marca.
const MaterialCheck = ({ on, t }) => (
  <MaterialIcons name={on ? 'check-box' : 'check-box-outline-blank'} size={22} color={on ? t.green : t.neutral} />
);

const makeStyles = (t) => StyleSheet.create({
  card: {
    backgroundColor: t.card,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  rowBold: { borderTopWidth: 1, borderTopColor: t.border, marginTop: 4, paddingTop: 10 },
  rowLabel: { fontSize: SIZES.font, color: t.textSecondary },
  rowLabelBold: { color: t.textPrimary, fontWeight: 'bold' },
  rowValue: { fontSize: SIZES.font, fontWeight: 'bold', color: t.textPrimary },
  rateRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  rateInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1.5,
    borderColor: t.green,
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.padding * 0.6,
  },
  rateInput: { minWidth: 44, paddingVertical: 6, fontSize: SIZES.font, color: t.green, fontWeight: '700', textAlign: 'right' },
  ratePct: { fontSize: SIZES.font, color: t.green, fontWeight: 'bold' },
  blockTitle: { fontSize: SIZES.font * 1.1, fontWeight: '500', color: t.textPrimary, marginTop: SIZES.padding * 1.5 },
  hint: { fontSize: SIZES.font * 0.85, color: t.textSecondary, marginBottom: SIZES.base },
  catRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: t.border },
  catName: { flex: 1, fontSize: SIZES.font, color: t.textPrimary },
  catTotal: { fontSize: SIZES.font, fontWeight: 'bold', color: t.textSecondary },
  empty: { fontSize: SIZES.font, color: t.textSecondary, marginTop: SIZES.padding },
});

export default FreelancerReport;
