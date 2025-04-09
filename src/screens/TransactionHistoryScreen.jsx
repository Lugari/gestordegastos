
import React from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import SearchInput from '../components/SearchInput';
import TransactionCard from '../components/TransactionCard';
import DateFilterTabs from '../components/DateFilterTabs';
import AddTransactionButton from '../components/AddTransactionButton';

import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const transactions = [
  { budget: "Alimentos", date: "01 Abr 2025", amount: "120.000", type: "expense" },
  { budget: "Transporte", date: "02 Abr 2025", amount: "35.000", type: "expense" },
  { budget: "Ingreso sueldo", date: "03 Abr 2025", amount: "2.500.000", type: "income" },
  { budget: "Renta", date: "04 Abr 2025", amount: "850.000", type: "expense" },
  { budget: "Vacaciones", date: "04 Abr 2025", amount: "150.000", type: "expense" },
  { budget: "Freelance", date: "05 Abr 2025", amount: "600.000", type: "income" },
  { budget: "Compras hogar", date: "05 Abr 2025", amount: "90.000", type: "expense" },
  { budget: "Salidas", date: "06 Abr 2025", amount: "70.000", type: "expense" },
  { budget: "Pago deuda", date: "06 Abr 2025", amount: "200.000", type: "expense" },
  { budget: "Venta artículos", date: "07 Abr 2025", amount: "300.000", type: "income" },
];




const TransactionHistoryScreen= () => {

  const navigation = useNavigation();

  const [filter, setFilter] = React.useState('Mes');
  
  return (

    <View style={{ flex: 1}}>
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.content}>

        <View style={{ marginBottom: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
         
          <SearchInput
             placeholder='categoría, monto, tipo...'
             style={{ flex: 3 }}
             
          />
          
          
          <MaterialIcons
            name="tune"
            size={18}
            color="#5f7067"
            style={styles.icon}
          />
        </View>

        <DateFilterTabs
          activeFilter={filter}
          onSelectFilter={(value) => {
            if (value === 'Personalizado') {
              // open date picker modal
            } else {
              setFilter(value);
            }
          }}
          showCustom
        />

        {transactions.map((item, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => navigation.navigate('SingleTransactionScreen', { transaction: item })}
            style={{ marginBottom: 10 }}
          >
            <TransactionCard
              key={index}
              budget={item.budget}
              date={item.date}
              amount={item.amount}
              type={item.type}
            />
          </TouchableOpacity>
          ))}


      </View>
    </ScrollView>
          <AddTransactionButton
            onPress={() => navigation.navigate('AddTransactionScreen', { transaction: transactions[0] })}
            icon="add"
            style={{ position: 'absolute', bottom: 20, right: 20 }}
          />
    </View>
  );
}

const styles = StyleSheet.create({ 
  container: {
    flexGrow: 1,
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