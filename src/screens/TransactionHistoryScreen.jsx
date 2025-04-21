import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import TransactionCard from '../components/transactions/TransactionCard';

import SearchInput from '../components/SearchInput';
import TransactionCard from '../components/transactions/TransactionCard';
import DateFilterTabs from '../components/DateFilterTabs';
import AddTransactionButton from '../components/FAB';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { useGetTransactions } from '../hooks/useTransactionData';

import { useBudgets } from '../hooks/useBudgets';



const TransactionHistoryScreen = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('Mes');

  // 2. Usa los hooks de React Query
  const { data: transactions = [], isLoading: isLoadingTransactions, error: transactionsError, refetch: refetchTransactions } = useGetTransactions();
  const { data: budgets = [], isLoading: isLoadingBudgets, error: budgetsError, refetch: refetchBudgets } = useGetBudgets();
  // const { deleteTransaction, isDeleting } = useManageTransactions(); // Si necesitas borrar aquí

  // ... (tu lógica de formattedDate, handleSearch, filtros de fecha)

  // Crear el mapa de presupuestos (como antes, pero usando los datos de useGetBudgets)
  const budgetMap = useMemo(() => {
    const map = new Map();
    budgets.forEach(b => map.set(b.id, b));
    return map;
  }, [budgets]);

  // Filtrar transacciones (como antes, usando los datos de useGetTransactions)
  const filteredTransactions = useMemo(() => {
     // ... tu lógica de filtrado usando 'transactions' ...
     // Asegúrate de filtrar por 'searchQuery' y 'dateFilter'
     const filtered = transactions.filter(transaction => {
        // ... lógica de búsqueda ...
        return true; // Placeholder
     });
     // Ordenar
     return [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions, searchQuery, dateFilter]);


  // 3. Manejo de Carga y Errores
  const isLoading = isLoadingTransactions || isLoadingBudgets;
  const error = transactionsError || budgetsError;

  if (isLoading) {
    // return renderLoading(); // Tu componente de carga
    return <ActivityIndicator size="large" />;
  }

  if (error) {
    // return renderError(); // Tu componente de error
     return (
       <View>
         <Text>Error: {error.message}</Text>
         <Button title="Reintentar" onPress={() => { refetchTransactions(); refetchBudgets(); }} />
       </View>
     );
  }


  const renderTransaction = ({ item }) => {
    const budget = budgetMap.get(item.budget_id);
    const budgetName = budget ? budget.name : 'Sin presupuesto';
    const budgetColor = budget ? budget.selectedColor : '#D9D9D9'; // Asume que 'selectedColor' existe
    const budgetIcon = budget ? budget.selectedIcon : 'account-balance-wallet'; // Asume que 'selectedIcon' existe

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('SingleTransactionScreen', {
            transactionId: item.id // Pasar solo el ID es más limpio si SingleTransactionScreen puede buscar sus propios datos
            // O pasar los datos como antes si prefieres:
            // transaction: item, budgetName, budgetColor, budgetIcon
         })}
        style={styles.transactionItem}
      >
        <TransactionCard
          // ... props ...
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

  // ... resto del componente usando 'filteredTransactions' para FlatList ...

  return (
     <View style={styles.container}>
        {/* ... Tus filtros y barra de búsqueda ... */}
         <FlatList
             data={filteredTransactions}
             renderItem={renderTransaction}
             keyExtractor={(item) => item.id}
             // ... otras props ...
         />
         {/* ... Tu FAB ... */}
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
});

export default TransactionHistoryScreen;