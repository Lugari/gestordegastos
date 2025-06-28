import { View, TextInput, Image, StyleSheet } from 'react-native';

import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import {COLORS, SIZES} from '../constants/theme';

const SearchInput = ({ iconPosition = 'left', placeholder = '', onChangeText, style }) => {
  const icon = (
    <MaterialIcons
      name="search"
      size={18}
      color={COLORS.neutral}
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
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.padding * 0.75,
    backgroundColor: COLORS.background,
    height: 44,
  },
  icon: {
    width: 18,
    height: 18,
    marginHorizontal: 8,
  },
  input: {
    flex: 1,
    fontSize: SIZES.font,
    color: COLORS.textPrimary,
  },
});

export default SearchInput;
