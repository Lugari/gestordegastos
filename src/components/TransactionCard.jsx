import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

const typeColors = {
  income: '#196819',
  expense: '#D76A61',
  saving: '#90afbb',
};

const TransactionCard = ({ budget, date, amount, type = 'expense' }) => {
  const amountColor = typeColors[type] || '#000';

  return (
    <View style={styles.card}>
      {/* Placeholder for image or icon */}
      <View style={styles.avatarPlaceholder} />

      <View style={styles.infoContainer}>
        <View style={styles.topRow}>
          <Text style={styles.budgetText}>{budget}</Text>
        <Text style={styles.subInfoText}>{type.toUpperCase()} • {date}</Text>
        </View>
      </View>
          <Text style={[styles.amountText, { color: amountColor }]}>${amount}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'space-between',    marginVertical: 6,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 3,
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#D9D9D9',
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',

  },
  topRow: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  budgetText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 14,
  },
  subInfoText: {
    marginTop: 4,
    fontSize: 12,
    color: '#7A7D62',
  },
  amountText: {
    fontSize: 18,
    fontWeight: '600',
  },
});

export default TransactionCard;
