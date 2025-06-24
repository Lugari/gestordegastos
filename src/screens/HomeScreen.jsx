import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, View, TouchableOpacity, ActivityIndicator, Image} from 'react-native';

import { useNavigation } from '@react-navigation/native';

import { useGetBudgets } from '../hooks/useBudgetsData';
import { useGetTransactions } from '../hooks/useTransactionData';
import { useGetSavings } from '../hooks/useSavingsData';

import Header from '../components/Header';
import CardBox from '../components/CardBox';
import CategoryBar from '../components/CategoryBar';

import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const HomeScreen = () => {

  const navigation = useNavigation();


  const { data: transactions = [], isLoading: isLoadingTrasactions, error: transactionsError, refetch: refetchTransactions } = useGetTransactions();
  const { data: budgets = [], isLoading: isLoadingBudgets, error: budgetsError, refetch: refetchBudgets } = useGetBudgets();
  const { data: savings = [], isLoading: isLoadingSavings, error: savingsError, refetch: refetchSavings } = useGetSavings();

  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalBalance, setTotalBalance] = useState(0);
    
  useEffect(() => {

    let currentIncome = 0;
    let currentExpense = 0;

      transactions.forEach(transaction => {
        const amount = parseFloat(transaction.amount);
        if (transaction.type.toLowerCase() === 'ingreso'){
          currentIncome += amount;
        }else if (transaction.type.toLowerCase() === 'gasto'){
          currentExpense+= amount;
        }
        });

        setTotalIncome(currentIncome);
        setTotalExpenses(currentExpense);
        setTotalBalance(currentIncome - currentExpense);
    }, [transactions]);

    `const { totalIncome, totalExpenses, totalBalance } = useMemo(() => {
      let income = 0;
      let expense = 0;

      transactions.forEach(transaction => {
        const amount = parseFloat(transaction.amount) || 0;
        if (transaction.type.toLowerCase() === 'ingreso'){
          income += amount;
        }else if (transaction.type.toLowerCase() === 'gasto'){
          expense += amount;
        }
      })
      const balance = income - expense;
      return {totalIcome: parseFloat(income), totalExpenses: parseFloat(expense), totalBalance: parseFloat(balance)}
    }, [transactions])`

  const topBudgets = useMemo(() => {
    const sortedBudgets = budgets.map((b => (
      {
        ...b,
        available: b.total - b.used,})))
    .sort((a,b) => b.available - a.available).slice(0, 3);
    
    return sortedBudgets
  }, [budgets]);

  const topSavings = useMemo(() => {
    const sortedSavings = savings.map((b => (
      {
        ...b,
        available: b.total - b.used,})))
    .sort((a,b) => b.available - a.available).slice(0, 3);
    
    return sortedSavings
  }, [savings]);
  

  if (isLoadingTrasactions) {
    return <ActivityIndicator />; 
}
  

  return (

    <ScrollView style={{ flex: 1}}>
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, width: '100%', height: '100%' }}>
        <Image 
          source={require('../assets/basic/background.png')}
          style={{ width: '100%'}}
          resizeMode="cover"
        />
      </View>

      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, gap: 20 }}>
        <Header username= "Usuario" />


        <TouchableOpacity onPress={() => navigation.navigate('TransactionHistoryScreen')}>
          <CardBox title="Balance total" amount={totalBalance >= 0 ? "$" + totalBalance.toLocaleString('es-CO') : "-$" + Math.abs(totalBalance).toLocaleString('es-CO')} seeMore="Historial de transacciones"   />
        </TouchableOpacity>
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 20 }}>
        
          <TouchableOpacity onPress={() => navigation.navigate('AddTransactionScreen', { transactionType: 'ingreso' })}>
            <CardBox title="Ingresos" amount={"$" + totalIncome.toLocaleString('es-CO')} seeMore={<MaterialIcons name="add" size={20} color="#4AD14A" />} size="s" color="#4AD14A"/>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('AddTransactionScreen', { transactionType: 'gasto' })}>
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
            {topSavings.map((saving) => (
                <CategoryBar key={saving.id} name={saving.name} total={saving.total} used={saving.used} color={saving.selectedColor} />
              ))}
            </>
            } seeMore={<MaterialIcons name="expand-more" size={24} color="black" />} />

        </TouchableOpacity>
      </View>

    </ScrollView>




  );
};

export default HomeScreen;
