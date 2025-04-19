import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import SearchInput from '../components/SearchInput';
import TransactionCard from '../components/TransactionCard';
import DateFilterTabs from '../components/DateFilterTabs';
import AddTransactionButton from '../components/FAB';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { useTransactions } from '../hooks/useTransactions';
import { useBudgets } from '../hooks/useBudgets';
import AddTransactionForm from '../components/AddTransactionForm';




const TransactionHistoryScreen = () => {

  const { transactions, loading, reload } = useTransactions();
  const { budgets } = useBudgets();

  const budget = budgets.find(b => b.id === transactions[0]?.budget_id);

  const budgetName = budget ? budget.name : 'Sin presupuesto';
  const budgetColor = budget ? budget.color : '#D9D9D9';
  const budgetIcon = budget ? budget.icon : 'account-balance-wallet';

  const navigation = useNavigation();
  const [dateFilter, setDateFilter] = useState('Mes');
  const [searchQuery, setSearchQuery] = useState('');

  const formattedDate = (date) => {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(date).toLocaleDateString('es-CO', options);
  };

  // Usar useMemo para filtrar y ordenar las transacciones
  const filteredTransactions = useMemo(() => {
    const filtered = transactions.filter(transaction => {
      const matchesSearch = 
        transaction.note?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.amount.toString().includes(searchQuery) ||
        transaction.type.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesSearch;
    });

    // Ordenar por fecha (más reciente primero)
    return [...filtered].sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );
  }, [transactions, searchQuery]);

  // Cargar transacciones cuando la pantalla recibe foco
  useFocusEffect(
    useCallback(() => {
      reload();
    }, [])
  );

  const handleSearch = (text) => {
    setSearchQuery(text);
  };

  const renderTransaction = ({ item }) => {
    
      const budget = budgets.find(b => b.id === item.budget_id);
      const budgetName = budget ? budget.name : 'Sin presupuesto';
      const budgetColor = budget ? budget.selectedColor : '#D9D9D9';
      const budgetIcon = budget ? budget.selectedIcon : 'account-balance-wallet';
  
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('SingleTransactionScreen', {transaction: item, budgetName, budgetColor, budgetIcon})}
        style={styles.transactionItem}
      >
        <TransactionCard
          idTransaction={item.id}
          name={budgetName}
          date={formattedDate(item.date)}
          amount={item.amount}
          type={item.type}
          icon={budgetIcon}
          color={budgetColor}
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

  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#5f7067" />
      <Text style={styles.loadingText}>Cargando transacciones...</Text>
    </View>
  );

  if (loading) {
    return renderLoading();
  }

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

      <AddTransactionButton
        onPress={() => navigation.navigate('AddTransactionScreen')}
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