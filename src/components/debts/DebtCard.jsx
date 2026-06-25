import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../../constants/theme';
import { useCurrency } from '../../context/CurrencyContext';

const DebtCard = ({ name, total }) => {
  const { format } = useCurrency();
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{name.toUpperCase()}</Text>
      <Text style={styles.amount}>{format(total)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginVertical: 6,
    elevation: 2,
  },
  title: {
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    fontSize: SIZES.font,
  },
  amount: {
    fontSize: SIZES.font * 1.2,
    fontWeight: 'bold',
    color: COLORS.danger,
  },
});

export default DebtCard;