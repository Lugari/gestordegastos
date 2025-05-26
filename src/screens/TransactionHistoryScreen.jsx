import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import SearchInput from '../components/SearchInput';
import TransactionCard from '../components/transactions/TransactionCard';
import DateFilterTabs from '../components/DateFilterTabs';
import FAB from '../components/FAB';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { useGetTransactions } from '../hooks/useTransactionData';
import { useGetBudgets } from '../hooks/useBudgetsData';
import { useGetSavings } from '../hooks/useSavingsData';




const TransactionHistoryScreen = () => {

  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('Mes')

  const { data: transactions = [], isLoading: isLoadingTransactions, error: transactionsError, refetch: refetchTransactions } = useGetTransactions();
  const { data: budgets = [], isLoading: isLoadingBudgets, error: budgetsError, refetch: refetchBudgets } = useGetBudgets();
  const { data: savings = [], isLoading: isLoadingSavings, error: savingsError, refetch: refetchSavings } = useGetSavings();

  const budgetMap = useMemo(() => {
    const map = new Map();
    budgets.forEach(b => map.set(b.id, b));
    return map;
  }, [budgets]);

  const formattedDate = (date) => {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(date).toLocaleDateString('es-CO', options);
  };


  const filteredTransactions = useMemo(() => {
    
    const filtered = transactions.filter(transaction => {
      
      const searchTerm = searchQuery.toLowerCase();
      const noteMatch = transaction.note?.toLowerCase().includes(searchTerm);
      const amountMatch = transaction.amount.toString().includes(searchTerm);
      const typeMatch = transaction.type.toLowerCase().includes(searchTerm);

      return noteMatch || amountMatch || typeMatch;
    });

    return [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));

 }, [transactions, searchQuery, dateFilter]);

 const isLoading = isLoadingTransactions || isLoadingBudgets;
 const error = transactionsError || budgetsError;

 if (isLoading) {
   return <ActivityIndicator size="large" />;
 }

 if (error) {
    return (
      <View>
        <Text>Error: {error.message}</Text>
        <Button title="Reintentar" onPress={() => { refetchTransactions(); refetchBudgets(); }} />
      </View>
    );
 }

  const handleSearch = (text) => {
    setSearchQuery(text);
  };

  const renderTransaction = ({ item }) => {
    let category;

    if (item.type === 'gasto'){

      category = budgets.find(b => b.id === item.budget_id);

    }else if (item.type === 'ahorro'){

      category = savings.find(s => s.id === item.budget_id);

    }else {

      category = {name: 'Cuenta principal', selectedColor: '#D9D9D9', selectedIcon: 'account-balance-wallet'};
    
    }

    const categoryName = category ? category.name : 'Cuenta principal';
    const categoryColor = category ? category.selectedColor : '#D9D9D9';
    const categoryIcon = category ? category.selectedIcon : 'account-balance-wallet'
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('SingleTransactionScreen', {transaction: item, categoryName, categoryColor, categoryIcon})}
        style={styles.transactionItem}
      >
        <TransactionCard
          idTransaction={item.id}
          name={categoryName}
          date={formattedDate(item.date)}
          amount={item.amount}
          type={item.type}
          icon={categoryIcon}
          color={categoryColor}
        />
      </TouchableOpacity>
    );
  }

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="receipt" size={48} color="#cdd1c5" />
      <Text style={styles.emptyText}>No hay transacciones registradas</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <SearchInput
          placeholder="Buscar por categoría, monto, tipo..."
          value={searchQuery}
          onChangeText={handleSearch}
          style={styles.searchInput}
        />
        <TouchableOpacity style={styles.filterButton}>
          <MaterialIcons
            name="tune"
            size={24}
            color="#5f7067"
          />
        </TouchableOpacity>
      </View>  

      <DateFilterTabs
        activeFilter={dateFilter}
        onSelectFilter={(value) => {
          if (value === 'Personalizado') {
            // TODO: Implementar selector de fecha personalizado
          } else {
            setDateFilter(value);
          }
        }}
        showCustom
      />

      <FlatList
        data={filteredTransactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyList}
        showsVerticalScrollIndicator={false}
      />

      <FAB
        onSelect={() => navigation.navigate('AddTransactionScreen')}
        style={styles.addButton}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 8,
  },
  searchInput: {
    flex: 1,
  },
  filterButton: {
    padding: 8,
  },
  listContent: {
    padding: 16,
  },
  transactionItem: {
    marginBottom: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#5f7067',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#5f7067',
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
});

export default TransactionHistoryScreen;