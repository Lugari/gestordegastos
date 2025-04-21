import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const BalanceBox = ({ title, amount, seeMore, size, color = '#000' }) => {
  return (
    <View style={[styles.container, size === 's' ? {minWidth:'40%'}: { width: '95%' }]}>
      <Text style={styles.title}>{title.toUpperCase()}</Text>

      <Text style={
        size === 's' ? { ...styles.amount, fontSize: 25, color} : styles.amount
        
      } >{amount}</Text>

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
    minWidth: '80%',
    padding: 20,
    paddingBottom: 4,
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
    fontSize: 48,
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
    fontSize: 14,
    color: '#787B63',
    fontWeight: 'bold', 
  },
    seeMoreContainer: {
        alignItems: 'center',
    },
});

export default BalanceBox;
