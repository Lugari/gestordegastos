import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import SearchInput from '../components/SearchInput';
import TransactionCard from '../components/transactions/TransactionCard';
import DateFilterTabs from '../components/DateFilterTabs';
import DateRangePickerModal from '../components/DateRangePickerModal';
import FAB from '../components/FAB';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { useGetTransactions } from '../hooks/useTransactionData';
import { useGetBudgets } from '../hooks/useBudgetsData';
import { useGetSavings } from '../hooks/useSavingsData';
import { useIsDesktop } from '../hooks/useResponsive';
import { getDateRange, isWithinRange } from '../utils/dateRange';

import { COLORS, SIZES } from '../constants/theme';




const TransactionHistoryScreen = () => {

  const navigation = useNavigation();
  const isDesktop = useIsDesktop();
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('Mes')
  const [customRange, setCustomRange] = useState(null); // { start, end }
  const [rangeModalVisible, setRangeModalVisible] = useState(false);

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

    const range = getDateRange(dateFilter, customRange);

    const filtered = transactions.filter(transaction => {

      // Filtro por rango de fechas (periodo o rango personalizado).
      if (!isWithinRange(transaction.date, range)) return false;

      const searchTerm = searchQuery.toLowerCase();
      const noteMatch = transaction.note?.toLowerCase().includes(searchTerm);
      const amountMatch = transaction.amount.toString().includes(searchTerm);
      const typeMatch = transaction.type.toLowerCase().includes(searchTerm);

      return noteMatch || amountMatch || typeMatch;
    });

    return [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));

 }, [transactions, searchQuery, dateFilter, customRange]);

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

      category = {name: 'Cuenta principal', color: '#D9D9D9', icon: 'account-balance-wallet'};
    
    }

    const categoryName = category ? category.name : 'Cuenta principal';
    const categoryColor = category ? category.color : '#D9D9D9';
    const categoryIcon = category ? category.icon : 'account-balance-wallet'
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
          currency={item.currency}
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
      <View style={[styles.content, isDesktop && styles.contentDesktop]}>
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
            setRangeModalVisible(true);
          } else {
            setDateFilter(value);
          }
        }}
        showCustom
      />

      {dateFilter === 'Personalizado' && customRange && (
        <TouchableOpacity style={styles.rangeChip} onPress={() => setRangeModalVisible(true)}>
          <MaterialIcons name="date-range" size={16} color={COLORS.textSecondary} />
          <Text style={styles.rangeChipText}>
            {formattedDate(customRange.start)} — {formattedDate(customRange.end)}
          </Text>
          <MaterialIcons name="edit" size={14} color={COLORS.textSecondary} />
        </TouchableOpacity>
      )}

      <FlatList
        data={filteredTransactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyList}
        showsVerticalScrollIndicator={false}
      />

      </View>

      <DateRangePickerModal
        visible={rangeModalVisible}
        initialStart={customRange?.start}
        initialEnd={customRange?.end}
        onCancel={() => setRangeModalVisible(false)}
        onApply={(range) => {
          setCustomRange(range);
          setDateFilter('Personalizado');
          setRangeModalVisible(false);
        }}
      />

      <FAB
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
    alignItems: 'center',
  },
  content: {
    flex: 1,
    width: '100%',
  },
  contentDesktop: {
    maxWidth: 860,
    paddingHorizontal: 8,
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
  rangeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 6,
    backgroundColor: COLORS.primary + '40',
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.padding * 0.75,
    paddingVertical: SIZES.padding * 0.4,
    marginBottom: 8,
  },
  rangeChipText: {
    fontSize: SIZES.font * 0.95,
    color: COLORS.textSecondary,
    fontWeight: '600',
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