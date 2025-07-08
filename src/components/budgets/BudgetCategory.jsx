import { View, Text, StyleSheet } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import {COLORS, SIZES} from '../../constants/theme';
import { useEffect, useState} from 'react';

const BudgetCategory = ({ name, used, total, color }) => {

  const [percentage, setPercentage] = useState(0);
  const isComplete = percentage >= 1;
  useEffect(() => {

  if (total > 0 && used <= total) {
    setPercentage(used / total);
  } else {
    setPercentage(1); // Aseguramos que el porcentaje no supere 1
  }
}, [used, total]);
  return (
    <View style={[styles.card, { backgroundColor: color + '44' }]}>
      <View style={styles.header}>
        <Text style={styles.title}>{name.toUpperCase()}</Text>
        <Text style={styles.amount}>
          <Text style={styles.highlight}>${used.toLocaleString('es-CO')}</Text> / ${total.toLocaleString('es-CO')}
        </Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { backgroundColor: color, width: `${Math.min(percentage, 1) * 100}%` }]} />
        {isComplete && (
          <MaterialIcons name="check-circle" size={18} color="#2AAD2A" style={styles.checkIcon} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginVertical: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    fontSize: SIZES.font,
  },
  amount: {
    fontSize: SIZES.font,
    fontWeight: 'bold',
  },
  highlight: {
    fontWeight: 'bold',
    fontSize: SIZES.font * 1.2,
    
  },
  progressContainer: {
    flexDirection: 'row',
    height: 10,
    width: '95%',
    backgroundColor: COLORS.background + '55',
    borderRadius: SIZES.radius,
    position: 'relative',
    overflow: 'visible',
    },
  progressBar: {
    height: '100%',
    borderRadius: SIZES.radius,
  },
  checkIcon: {
    position: 'absolute',
    top: -6,
    right: -20,
    borderRadius: SIZES.radius * 1.3,
  },
});

export default BudgetCategory;
