import {useEffect, useState} from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { ProgressChart } from 'react-native-chart-kit';

import { COLORS, SIZES } from '../../constants/theme';

const screenWidth = Dimensions.get('window').width;

const BudgetProgressCard = ({ title, used, total, color="#3498db" }) => {

  const [percentage, setPercentage] = useState(0);

  useEffect(() => {
  
  if (total >0 && used <= total) {
    setPercentage(used / total);
  } else {
    setPercentage(1) // Aseguramos que el porcentaje no supere 1
  }
  }, [used, total]);

  const hexToRgba = (hex, opacity = 1) => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${opacity})`
  }
  


  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title.toUpperCase()}</Text>

      <View style={{ justifyContent:'center', alignItems:'center', }} >

      <ProgressChart
        data={{ data: [percentage] }}
        width={screenWidth * 0.6}
        height={screenWidth * 0.6}
        strokeWidth={16}
        radius={100}
        chartConfig={{
          backgroundColor: COLORS.background,
          backgroundGradientFrom: COLORS.background,
          backgroundGradientTo: COLORS.background,
          color: (opacity = 1) => hexToRgba(color, 0.25), 
          strokeWidth: 12,
          
        }}
        hideLegend={true}
        style={styles.chart}
      />
      
        <View style={styles.centeredText}>
            <Text style={[styles.percentageText,{ color }]}>
            {`${Math.round(percentage * 100)}%`}
            </Text>
        </View>

      </View>


      <Text style={[styles.amount, { color }]}>
        ${used.toLocaleString('es-CO')} 
        <Text style={styles.total}> / ${total.toLocaleString('es-CO')}</Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  title: {
    fontWeight: 'bold',
    fontSize: SIZES.font * 1.2,
    marginBottom: 8,
    color: COLORS.textPrimary,
  },
  chart: {
    marginBottom: 16,
  },
  centeredText: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentageText: {
    fontSize: 56,
    fontWeight: 'bold',
    },
  amount: {
    fontSize: SIZES.font * 1.8,
    fontWeight: 'bold',
  },
  total: {
    fontSize: SIZES.font * 1.2,
    color: COLORS.textSecondary,
    fontWeight: 'normal',
  },
});

export default BudgetProgressCard;
