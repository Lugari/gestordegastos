
import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import HeaderBack from '../components/HeaderBack';



const TransactionHistoryScreen= () => {
  return (
    <ScrollView style={styles.container}>
      <HeaderBack title="Historial de transacciones" />
      <View style={styles.content}>
        <Text style={styles.title}>Historial de transacciones</Text>
        {/* Aquí puedes agregar más contenido relacionado con el historial de transacciones */}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});
export default TransactionHistoryScreen;