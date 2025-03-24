import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const BalanceBox = ({ title, amount, seeMore }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title.toUpperCase()}</Text>
      <Text style={styles.amount}>{amount}</Text>
      <View style={styles.seeMoreContainer}>
      <View style={styles.divider} />
      <Text style={styles.seeMore}>{seeMore}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8F9FA', // Fondo claro
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3, // Sombra en Android
    alignItems: 'left',      
  },
  title: {
    fontSize: 12,
    color: '#787B63', // Color similar al de la imagen
    fontWeight: 'bold',
  },
  amount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginVertical: 4,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#C4C4C4',
    marginVertical: 8,
  },
  seeMore: {
    fontSize: 12,
    color: '#787B63',
    fontWeight: 'bold', 
  },
    seeMoreContainer: {
        alignItems: 'center',
    },
});

export default BalanceBox;
