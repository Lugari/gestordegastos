import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

import {COLORS, SIZES} from '../constants/theme';

const GREEN = '#1C6B52';
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
              {label}
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
    backgroundColor: '#EFEFE8',
    borderRadius: 999,
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding*.5,
    marginRight: 8,
  },
  filterText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.font,
    fontWeight: '600',
  },
  activeButton: {
    backgroundColor: GREEN,
  },
  activeText: {
    color: '#fff',
  },
});

export default DateFilterTabs;
