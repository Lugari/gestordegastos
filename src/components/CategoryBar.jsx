import { View, Text, StyleSheet } from 'react-native';

import {SIZES, COLORS} from '../constants/theme';

const CategoryBar = ({ name, total, used, color='#005' }) => {
  const percentage = Math.round((used / total) * 100); // Calculate percentage
  return (
    <View style={styles.container}>
      <Text style={styles.categoryName}>{name.toUpperCase()}</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignContent: 'center', width: '100%' }}>
        <View style={[styles.progressBar, { backgroundColor: color + '55' }]}>
          <View style={[styles.progressFill, { width: `${percentage}%`, backgroundColor:color }]} />
        </View>
        <Text style={[styles.percentage, {color}]}>{ percentage }%</Text>
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
