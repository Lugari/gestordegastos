import { View, Text, StyleSheet } from 'react-native';

import {SIZES, COLORS} from '../constants/theme';
import { useEffect, useState } from 'react';

const CategoryBar = ({ name, total, used, color='#005' }) => {
  
  //const percentage = Math.round((used / total) * 100);

  const [percentage, setPercentage] = useState(0);

  useEffect(() => {
  
  if (total > 0 && used <= total) {
    setPercentage (used / total)
  } else {
    setPercentage(1); // Aseguramos que el porcentaje no supere 1
  }
}, [used, total]);
  return (
    <View style={styles.container}>
      <Text style={styles.categoryName}>{name.toUpperCase()}</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignContent: 'center', width: '100%' }}>
        <View style={[styles.progressBar, { backgroundColor: color + '55' }]}>
          <View style={[styles.progressFill, { width: `${percentage*100}%`, backgroundColor:color  }]} />
        </View>
        <Text style={[styles.percentage, {color: color}]}>{ Math.round(percentage*100) }%</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    color: COLORS.background,
  },
  categoryName: {
    fontSize: SIZES.font,
    color: COLORS.textPrimary,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 12,
    width: '90%',
    borderRadius: SIZES.radius,
    marginVertical: SIZES.base,
  },

  progressFill: {
    height: '100%',
    borderRadius: SIZES.radius,
  },
  
  percentage: {
    fontSize: SIZES.font*1.2,
    fontWeight: 'bold',
    textAlign: 'right',
  },
});

export default CategoryBar;
