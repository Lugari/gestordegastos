import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, View, TouchableOpacity, ActivityIndicator, Image, StyleSheet } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';

import { useGetBudgets } from '../hooks/useBudgetsData';
import { useGetTransactions } from '../hooks/useTransactionData';
import { useGetSavings } from '../hooks/useSavingsData';
import { useGetDebts } from '../hooks/useDebtsData';
import { useGetInvestments } from '../hooks/useInvestmentsData';
import { useIsDesktop } from '../hooks/useResponsive';
import { useCurrency } from '../context/CurrencyContext';

import Header from '../components/Header';
import CardBox from '../components/CardBox';
import CategoryBar from '../components/CategoryBar';

import { COLORS } from '../constants/theme';

import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const HomeScreen = () => {
  const navigation = useNavigation();
  const isDesktop = useIsDesktop();
  const { format } = useCurrency();

  const { data: transactions = [], isLoading: isLoadingTrasactions, error: transactionsError, refetch: refetchTransactions } = useGetTransactions();
  const { data: budgets = [], isLoading: isLoadingBudgets, error: budgetsError, refetch: refetchBudgets } = useGetBudgets();
  const { data: savings = [], isLoading: isLoadingSavings, error: savingsError, refetch: refetchSavings } = useGetSavings();
  const { data: debts = [], isLoading: isLoadingDebts, error: debtsError, refetch: refetchDebts } = useGetDebts();
  const { data: investments = [], isLoading: isLoadingInvestments } = useGetInvestments();

  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalBalance, setTotalBalance] = useState(0);

  useEffect(() => {
    let currentIncome = 0;
    let currentExpense = 0;

    transactions.forEach(transaction => {
      const amount = parseFloat(transaction.amount);
      if (transaction.type.toLowerCase() === 'ingreso') {
        currentIncome += amount;
      } else if (transaction.type.toLowerCase() === 'gasto') {
        currentExpense += amount;
      } else if (transaction.type.toLowerCase() === 'ahorro') {
        const saving = savings.find(s => s.id === transaction.budget_id);
        if (saving && (saving.showable === false || saving.showable === undefined)) {
          currentExpense += amount;
        }
      }
    });

    setTotalIncome(currentIncome);
    setTotalExpenses(currentExpense);
    setTotalBalance(currentIncome - currentExpense);
  }, [transactions, savings]);

  const topBudgets = useMemo(() => {
    const sortedBudgets = budgets.map(b => (
      {
        ...b,
        available: b.total - b.used,
      })).sort((a, b) => b.available - a.available).slice(0, 3);

    return sortedBudgets;
  }, [budgets]);

  const topSavings = useMemo(() => {
    const sortedSavings = savings.map(s => (
      {
        ...s,
        available: s.total - s.used,
      })).sort((a, b) => b.available - a.available).slice(0, 3);

    return sortedSavings;
  }, [savings]);

  const totalDebts = useMemo(() => {
    return debts.reduce((acc, debt) => acc + debt.total, 0);
  }, [debts]);

  const totalInvestments = useMemo(() => {
    return investments.reduce((acc, inv) => acc + (inv.used || 0), 0);
  }, [investments]);

  const fling = Gesture.Fling()
    .direction(2)
    .onEnd(() => {
      navigation.navigate('ReportsScreen');
    });

  if (isLoadingTrasactions || isLoadingBudgets || isLoadingSavings || isLoadingDebts || isLoadingInvestments) {
    return <ActivityIndicator />;
  }

  const balanceText = format(totalBalance);

  // --- Diseño de escritorio: dashboard centrado en grilla ---
  if (isDesktop) {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: COLORS.background }} contentContainerStyle={dStyles.scroll}>
        <View style={dStyles.page}>
          <Header username="Usuario" />

          <View style={dStyles.toReports}>
            <TouchableOpacity style={dStyles.reportsLink} onPress={() => navigation.navigate('ReportsScreen')}>
              <MaterialIcons name="bar-chart" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Fila principal: balance grande + ingresos/egresos */}
          <View style={dStyles.row}>
            <TouchableOpacity style={{ flex: 2 }} onPress={() => navigation.navigate('TransactionHistoryScreen')}>
              <CardBox title="Balance total" amount={balanceText} seeMore="Historial de transacciones" />
            </TouchableOpacity>

            <View style={dStyles.stackColumn}>
              <TouchableOpacity onPress={() => navigation.navigate('AddTransactionScreen', { transactionType: 'ingreso' })}>
                <CardBox title="Ingresos" amount={format(totalIncome)} seeMore={<MaterialIcons name="add" size={20} color="#4AD14A" />} size="s" color="#4AD14A" />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigation.navigate('AddTransactionScreen', { transactionType: 'gasto' })}>
                <CardBox title="Egresos" amount={format(Math.abs(totalExpenses))} seeMore={<MaterialIcons name="add" size={20} color="#D76A61" />} size="s" color="#D76A61" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Fila presupuestos + ahorros */}
          <View style={dStyles.row}>
            <TouchableOpacity style={{ flex: 1 }} onPress={() => navigation.navigate('BudgetsScreen')}>
              <CardBox title="Presupuesto" amount={
                <>
                  {topBudgets.map((budget) => (
                    <CategoryBar key={budget.id} name={budget.name} total={budget.total} used={budget.used} color={budget.color} />
                  ))}
                </>
              } seeMore={<MaterialIcons name="expand-more" size={24} color="black" />} />
            </TouchableOpacity>

            <TouchableOpacity style={{ flex: 1 }} onPress={() => navigation.navigate('SavingsScreen')}>
              <CardBox title="Ahorros" amount={
                <>
                  {topSavings.map((saving) => (
                    <CategoryBar key={saving.id} name={saving.name} total={saving.total} used={saving.used} color={saving.color} />
                  ))}
                </>
              } seeMore={<MaterialIcons name="expand-more" size={24} color="black" />} />
            </TouchableOpacity>
          </View>

          {/* Fila deudas + inversiones */}
          <View style={dStyles.row}>
            <TouchableOpacity style={{ flex: 1 }} onPress={() => navigation.navigate('DebtsScreen')}>
              <CardBox title="Deudas" amount={format(totalDebts)} seeMore="Ver deudas" size="s" color="#D76A61" />
            </TouchableOpacity>
            <TouchableOpacity style={{ flex: 1 }} onPress={() => navigation.navigate('InvestmentsScreen')}>
              <CardBox title="Inversiones" amount={format(totalInvestments)} seeMore="Ver inversiones" size="s" color="#4AD14A" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  }

  // --- Diseño móvil original ---
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GestureDetector gesture={fling}>
        <ScrollView style={{ flex: 1 }}>
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, width: '100%', height: '100%' }}>
            <Image
              source={require('../assets/basic/background.png')}
              style={{ width: '100%' }}
              resizeMode="cover"
            />
          </View>

          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, gap: 20 }}>
            <Header username="Usuario" />

            <TouchableOpacity onPress={() => navigation.navigate('TransactionHistoryScreen')}>
              <CardBox title="Balance total" amount={balanceText} seeMore="Historial de transacciones" />
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 20 }}>
              <TouchableOpacity onPress={() => navigation.navigate('AddTransactionScreen', { transactionType: 'ingreso' })}>
                <CardBox title="Ingresos" amount={format(totalIncome)} seeMore={<MaterialIcons name="add" size={20} color="#4AD14A" />} size="s" color="#4AD14A" />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigation.navigate('AddTransactionScreen', { transactionType: 'gasto' })}>
                <CardBox title="Egresos" amount={format(Math.abs(totalExpenses))} seeMore={<MaterialIcons name="add" size={20} color="#D76A61" />} size="s" color="#D76A61" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => navigation.navigate('BudgetsScreen')}>
              <CardBox title="Presupuesto" amount={
                <>
                  {topBudgets.map((budget) => (
                    <CategoryBar key={budget.id} name={budget.name} total={budget.total} used={budget.used} color={budget.color} />
                  ))}
                </>
              } seeMore={<MaterialIcons name="expand-more" size={24} color="black" />} />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('SavingsScreen')}>
              <CardBox title="Ahorros" amount={
                <>
                  {topSavings.map((saving) => (
                    <CategoryBar key={saving.id} name={saving.name} total={saving.total} used={saving.used} color={saving.color} />
                  ))}
                </>
              } seeMore={<MaterialIcons name="expand-more" size={24} color="black" />} />
            </TouchableOpacity>


            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 20 }}>
              <TouchableOpacity onPress={() => navigation.navigate('DebtsScreen')}>
                <CardBox title="Deudas" amount={format(totalDebts)} seeMore="Ver deudas" size="s" color="#D76A61" />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigation.navigate('InvestmentsScreen')}>
                <CardBox title="Inversiones" amount={format(totalInvestments)} seeMore="Ver inversiones" size="s" color="#4AD14A" />
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
      </GestureDetector>
    </GestureHandlerRootView>
  );
};

const dStyles = StyleSheet.create({
  scroll: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  page: {
    width: '100%',
    maxWidth: 1080,
    gap: 20,
  },
  toReports: {
    alignItems: 'flex-end',
    marginTop: -8,
  },
  reportsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    gap: 20,
    alignItems: 'stretch',
  },
  stackColumn: {
    flex: 1,
    gap: 20,
  },
});

export default HomeScreen;
