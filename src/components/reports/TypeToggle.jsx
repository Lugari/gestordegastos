import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import { TX_TYPES } from '../../constants/reportTypes';
import { COLORS, SIZES } from '../../constants/theme';

// Selector de tipos de transacción (ingreso / gasto / ahorro) para el reporte.
const TypeToggle = ({ selected, onChange }) => {
  const toggle = (value) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <View style={styles.row}>
      {TX_TYPES.map((t) => {
        const active = selected.includes(t.value);
        return (
          <TouchableOpacity
            key={t.value}
            style={[styles.chip, active && { backgroundColor: t.color + '33', borderColor: t.color }]}
            onPress={() => toggle(t.value)}
          >
            <Text style={[styles.label, active && { color: COLORS.textPrimary }]}>{t.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding * 0.5,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.neutral,
    backgroundColor: COLORS.background,
  },
  label: {
    fontSize: SIZES.font,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
});

export default TypeToggle;
