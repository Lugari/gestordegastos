import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

import { SIZES } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

const SecondaryButton = ({ title, onPress }) => {
  const { theme } = useTheme();
  return (
  <TouchableOpacity style={[styles.button, { backgroundColor: theme.card, borderColor: theme.border }]} onPressIn={onPress}>
    <Text style={[styles.text, { color: theme.textPrimary }]}>{title}</Text>
  </TouchableOpacity>
);
};

const styles = StyleSheet.create({
  button: {
        borderWidth: 1,
        paddingVertical: SIZES.padding * 0.75,
    paddingHorizontal: SIZES.padding * 1.25,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    elevation: 1,
  },
  text: {
        fontWeight: 'bold',
    fontSize: 14,
  },
});

export default SecondaryButton;
