import { View, TextInput, Image, StyleSheet } from 'react-native';

import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { SIZES } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

const SearchInput = ({ iconPosition = 'left', placeholder = '', onChangeText, style }) => {
  const { theme } = useTheme();
  const icon = (
    <MaterialIcons
      name="search"
      size={18}
      color={theme.neutral}
      style={styles.icon}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.cardAlt }, style]}>
      {iconPosition === 'left' && icon}
      <TextInput
        style={[styles.input, { color: theme.textPrimary }]}
        placeholder={placeholder}
        placeholderTextColor={theme.neutral}
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
  },
});

export default SearchInput;
