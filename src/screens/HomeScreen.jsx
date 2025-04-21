import React, { use, useEffect, useMemo, useState } from 'react';
import { ScrollView, View, TouchableOpacity } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { useBudgets } from '../hooks/useBudgets';
import { useTransactions } from '../hooks/useTransactions';

import Header from '../components/Header';
import CardBox from '../components/CardBox';
import CategoryBar from '../components/CategoryBar';

import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const HomeScreen = () => {

  const { budgets } = useBudgets();
  const { transactions } = useTransactions();

  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalBalance, setTotalBalance] = useState(0);
    
  useEffect(() => {
    
      transactions.forEach(transaction => {
        const amount = parseFloat(transaction.amount);
        if (transaction.type.toLowerCase() === 'ingreso') setTotalIncome(totalIncome + amount);
        if (transaction.type.toLowerCase() === 'gasto') setTotalExpenses(totalExpenses + amount);      });
    
      setTotalBalance(totalIncome + totalExpenses);
    }, [transactions]);

  const topBudgets = useMemo(() => {
    const sortedBudgets = budgets.map((b => (
      {
        ...b,
        available: b.total - b.used,})))
    .sort((a,b) => b.available - a.available).slice(0, 3);
    
    return sortedBudgets
  }, [budgets]);
  


  const navigation = useNavigation();


  

  return (

    <ScrollView style={{ flex: 1}}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, gap: 20 }}>
        <Header username= "Lucas" />


        <TouchableOpacity onPress={() => navigation.navigate('TransactionHistoryScreen')}>
          <CardBox title="Balance total" amount={"$" + totalBalance.toLocaleString('es-CO')} seeMore="Historial de transacciones"   />
        </TouchableOpacity>
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 20 }}>
        
          <TouchableOpacity onPress={() => navigation.navigate('AddTransactionScreen', { transactionType: 'Ingreso' })}>
            <CardBox title="Ingresos" amount={"$" + totalIncome.toLocaleString('es-CO')} seeMore={<MaterialIcons name="add" size={20} color="#4AD14A" />} size="s" color="#4AD14A"/>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('AddTransactionScreen', { transactionType: 'Egreso' })}>
            <CardBox title="Egresos" amount={'$' + Math.abs(totalExpenses).toLocaleString('es-CO')} seeMore={<MaterialIcons name="add" size={20} color="#D76A61" />} size="s" color="#D76A61" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('BudgetsScreen')}>

          <CardBox title="Presupuesto" amount={
            <>
              {topBudgets.map((budget) => (
                <CategoryBar key={budget.id} name={budget.name} total={budget.total} used={budget.used} color={budget.selectedColor} />
              ))}
            </>
            } seeMore={<MaterialIcons name="expand-more" size={24} color="black" />} />

        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('SavingsScreen')}>

          <CardBox title="Ahorros" amount={
            <>
            <CategoryBar name="Moto" total={5000000} used={3500000} />
            <CategoryBar name="PS5" total={500000} used={460000} />
            </>
            } seeMore={<MaterialIcons name="expand-more" size={24} color="black" />} />

        </TouchableOpacity>
      </View>

    </ScrollView>




  );
};

export default HomeScreen;
