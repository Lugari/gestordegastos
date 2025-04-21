import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { ProgressChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const BudgetProgressCard = ({ title, used, total, color="#3498db" }) => {

  const percentage = total > 0 ? used / total : 0;

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
          backgroundColor: '#FFFFFF',
          backgroundGradientFrom: '#FFFFFF',
          backgroundGradientTo: '#ffffff',
          color: (opacity = 1) => hexToRgba(color, opacity), // #3498db en RGBA
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
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
    color: '#111',
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
    fontSize: 24,
    fontWeight: 'bold',
  },
  total: {
    fontSize: 14,
    color: '#888',
    fontWeight: 'normal',
  },
});

export default BudgetProgressCard;
