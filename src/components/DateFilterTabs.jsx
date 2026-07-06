import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

import { SIZES } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

const FILTERS = ['Mes', 'Semana', 'Trimestre', 'Año'];

const DateFilterTabs = ({ activeFilter, onSelectFilter, showCustom = false, customLabel = 'Personalizado' }) => {
  const { theme } = useTheme();
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
              { backgroundColor: theme.cardAlt },
              activeFilter === label && { backgroundColor: theme.green },
            ]}
            onPress={() => onSelectFilter(label)}
          >
            <Text
              style={[
                styles.filterText,
                { color: theme.textSecondary },
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
    borderRadius: 999,
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding*.5,
    marginRight: 8,
  },
  filterText: {
    fontSize: SIZES.font,
    fontWeight: '600',
  },
  activeText: {
    color: '#fff',
  },
});

export default DateFilterTabs;
