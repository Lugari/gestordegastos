import { View, Text, StyleSheet } from 'react-native';

import {COLORS, SIZES} from '../constants/theme';

const BalanceBox = ({ title, amount, seeMore, size, color = '#000' }) => {
  return (
    <View style={[styles.container, size === 's' ? {minWidth:'40%'}: { width: '95%' }]}>
      <Text style={styles.title}>{title.toUpperCase()}</Text>

      <Text style={
        size === 's' ? { ...styles.amount, fontSize: SIZES.font*2, color} : styles.amount
        
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
    backgroundColor: COLORS.background, // Fondo claro
    minWidth: '80%',
    padding: SIZES.padding,
    paddingBottom: 4,
    borderRadius: SIZES.radius,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3, // Sombra en Android
    alignItems: 'left',      
  },
  title: {
    fontSize: SIZES.font,
    color: COLORS.neutral,
    fontWeight: 'bold',
  },
  amount: {
    fontSize: SIZES.font * 3.2,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginVertical: 4,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#C4C4C4',
    marginVertical: SIZES.base,
  },
  seeMore: {
    fontSize: SIZES.font,
    color: COLORS.textSecondary,
    fontWeight: 'bold', 
  },
    seeMoreContainer: {
        alignItems: 'center',
    },
});

export default BalanceBox;
