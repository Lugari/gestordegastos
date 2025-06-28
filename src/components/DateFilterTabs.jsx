import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

import {COLORS, SIZES} from '../constants/theme';

const FILTERS = ['Mes', 'Semana', 'Trimestre', 'Año'];

const DateFilterTabs = ({ activeFilter, onSelectFilter, showCustom = false, customLabel = 'Personalizado' }) => {
  const filters = [...FILTERS, ...(showCustom ? [customLabel] : [])];

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filters.map((label) => (
          <TouchableOpacity
            key={label}
            style={[
              styles.filterButton,
              activeFilter === label && styles.activeButton,
            ]}
            onPress={() => onSelectFilter(label)}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === label && styles.activeText,
              ]}
            >
              {label.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 12,
  },
  scrollContent: {
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  filterButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.padding*.9,
    paddingVertical: SIZES.padding*.5,
    marginRight: 10,
  },
  filterText: {
    color: COLORS.textPrimary,
    fontSize: SIZES.font,
    fontWeight: '600',
  },
  activeButton: {
    backgroundColor: COLORS.primary + '40',
  },
  activeText: {
    color: COLORS.textSecondary,
  },
});

export default DateFilterTabs;
