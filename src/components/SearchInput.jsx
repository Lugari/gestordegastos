import React from 'react';
import { View, TextInput, Image, StyleSheet } from 'react-native';

import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const SearchInput = ({ iconPosition = 'left', placeholder = '', onChangeText, style }) => {
  const icon = (
    <MaterialIcons
      name="search"
      size={18}
      color="#5f7067"
      style={styles.icon}
    />
  );

  return (
    <View style={[styles.container, style]}>
      {iconPosition === 'left' && icon}
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#cdd1c5"
        onChangeText={onChangeText}
      />
      {iconPosition === 'right' && icon}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f1f6f4',
    height: 44,
  },
  icon: {
    width: 18,
    height: 18,
    tintColor: '#5f7067',
    marginHorizontal: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
});

export default SearchInput;
