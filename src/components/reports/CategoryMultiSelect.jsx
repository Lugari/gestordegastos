import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { COLORS, SIZES } from '../../constants/theme';

// Selector múltiple de categorías (presupuestos + metas de ahorro).
// `items` es un array de { id, name, color, icon }. Vacío = todas.
const CategoryMultiSelect = ({ items, selected, onChange }) => {
  const toggle = (id) => {
    if (selected.includes(id)) {
      onChange(selected.filter((v) => v !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  if (items.length === 0) {
    return <Text style={styles.empty}>No hay categorías todavía.</Text>;
  }

  return (
    <View style={styles.row}>
      {items.map((c) => {
        const active = selected.includes(c.id);
        return (
          <TouchableOpacity
            key={c.id}
            style={[styles.chip, { borderColor: c.color }, active && { backgroundColor: c.color + '33' }]}
            onPress={() => toggle(c.id)}
          >
            {c.icon ? <MaterialIcons name={c.icon} size={16} color={COLORS.textSecondary} /> : null}
            <Text style={styles.label}>{c.name}</Text>
            {active ? <MaterialIcons name="check" size={16} color={COLORS.textSecondary} /> : null}
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: SIZES.padding * 0.75,
    paddingVertical: SIZES.padding * 0.5,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    backgroundColor: COLORS.background,
  },
  label: {
    fontSize: SIZES.font,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  empty: {
    fontSize: SIZES.font,
    color: COLORS.textSecondary,
  },
});

export default CategoryMultiSelect;
