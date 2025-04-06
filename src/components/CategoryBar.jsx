import React from 'react';
import { View, Text, StyleSheet } from 'react-native';



const CategoryBar = ({ name, total, used, color='#005' }) => {
  const percentage = Math.round((used / total) * 100); // Calculate percentage
  return (
    <View style={styles.container}>
      <Text style={styles.categoryName}>{name.toUpperCase()}</Text>
      <Text style={styles.percentage}>{used.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })} / {total.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })}</Text>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${percentage}%`, backgroundColor:color }]} />
      </View>
      <Text style={styles.percentage}>{percentage}%</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  categoryName: {
    fontSize: 12,
    color: '#787B63', // Similar to your image
    fontWeight: 'bold',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E0E0E0', // Light gray background
    borderRadius: 3,
    overflow: 'hidden',
    marginVertical: 4,
  },
  progressFill: {
    height: '100%',
    //backgroundColor: '#8A2BE2', // Purple progress color
  },
  percentage: {
    fontSize: 10,
    color: '#005', // Matching the bar color
    fontWeight: 'bold',
    textAlign: 'right',
  },
});

export default CategoryBar;
