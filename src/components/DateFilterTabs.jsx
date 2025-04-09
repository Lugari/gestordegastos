import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

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
    backgroundColor: '#b1c3cb',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 10,
  },
  filterText: {
    color: '#1a1a1a',
    fontSize: 13,
    fontWeight: '600',
  },
  activeButton: {
    backgroundColor: '#39454e',
  },
  activeText: {
    color: '#ffffff',
  },
});

export default DateFilterTabs;
