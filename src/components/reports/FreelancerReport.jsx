import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { COLORS, SIZES } from '../../constants/theme';
import { money } from '../../utils/formatMoney';

const Row = ({ label, value, color, bold }) => (
  <View style={[styles.row, bold && styles.rowBold]}>
    <Text style={[styles.rowLabel, bold && styles.rowLabelBold]}>{label}</Text>
    <Text style={[styles.rowValue, color && { color }, bold && { fontSize: SIZES.font * 1.3 }]}>{money(value)}</Text>
  </View>
);

// Vista de la plantilla "Freelancer": apoyo para declaración de impuestos.
const FreelancerReport = ({ summary, expenseCategories, deductibleIds, taxRate, onToggleDeductible, onChangeRate }) => {
  const { grossIncome, deductibleTotal, taxableBase, tax, afterTax, count } = summary;
  const deductibleSet = new Set(deductibleIds);

  if (count === 0) {
    return <Text style={styles.empty}>No hay transacciones para los filtros seleccionados.</Text>;
  }

  return (
    <View>
      <View style={styles.banner}>
        <MaterialIcons name="receipt-long" size={20} color={COLORS.textPrimary} />
        <Text style={styles.bannerText}>Resumen para declaración de impuestos</Text>
      </View>

      {/* Resumen fiscal */}
      <View style={styles.card}>
        <Row label="Ingreso bruto" value={grossIncome} color={COLORS.success} />
        <Row label="Gastos deducibles" value={deductibleTotal} color={COLORS.danger} />
        <Row label="Base gravable" value={taxableBase} bold />

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

        <Row label="Impuesto estimado" value={tax} color={COLORS.danger} />
        <Row label="Resultado después de impuestos" value={afterTax} bold color={afterTax >= 0 ? COLORS.success : COLORS.danger} />
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
              <MaterialIcons
                name={on ? 'check-box' : 'check-box-outline-blank'}
                size={22}
                color={on ? COLORS.success : COLORS.neutral}
              />
              <Text style={styles.catName}>{c.name}</Text>
              <Text style={styles.catTotal}>{money(c.total)}</Text>
            </TouchableOpacity>
          );
        })
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: SIZES.padding,
  },
  bannerText: {
    fontSize: SIZES.font * 1.1,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  rowBold: {
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    marginTop: 4,
    paddingTop: 10,
  },
  rowLabel: { fontSize: SIZES.font, color: COLORS.textSecondary },
  rowLabelBold: { color: COLORS.textPrimary, fontWeight: 'bold' },
  rowValue: { fontSize: SIZES.font, fontWeight: 'bold', color: COLORS.textPrimary },
  rateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  rateInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: COLORS.neutral,
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.padding * 0.6,
  },
  rateInput: {
    minWidth: 44,
    paddingVertical: 6,
    fontSize: SIZES.font,
    color: COLORS.textPrimary,
    textAlign: 'right',
  },
  ratePct: { fontSize: SIZES.font, color: COLORS.textSecondary, fontWeight: 'bold' },
  blockTitle: {
    fontSize: SIZES.font * 1.1,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: SIZES.padding * 1.5,
  },
  hint: {
    fontSize: SIZES.font * 0.85,
    color: COLORS.textSecondary,
    marginBottom: SIZES.base,
  },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  catName: { flex: 1, fontSize: SIZES.font, color: COLORS.textPrimary },
  catTotal: { fontSize: SIZES.font, fontWeight: 'bold', color: COLORS.textSecondary },
  empty: { fontSize: SIZES.font, color: COLORS.textSecondary, marginTop: SIZES.padding },
});

export default FreelancerReport;
