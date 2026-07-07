import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SectionList, ActivityIndicator, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import SearchInput from '../components/SearchInput';
import DateFilterTabs from '../components/DateFilterTabs';
import DateRangePickerModal from '../components/DateRangePickerModal';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { useGetTransactions } from '../hooks/useTransactionData';
import { useGetBudgets } from '../hooks/useBudgetsData';
import { useGetSavings } from '../hooks/useSavingsData';
import { useIsDesktop } from '../hooks/useResponsive';
import { useCurrency } from '../context/CurrencyContext';
import { getDateRange, isWithinRange } from '../utils/dateRange';

import { SIZES } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

// Colores de monto por tipo (legibles, escaneo rápido).


// Etiqueta de día relativa: Hoy / Ayer / fecha.
const dayLabel = (date) => {
  const d = new Date(date);
  const today = new Date();
  const yest = new Date();
  yest.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Hoy';
  if (d.toDateString() === yest.toDateString()) return 'Ayer';
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' });
};

const TransactionHistoryScreen = () => {
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const INCOME = theme.income, EXPENSE = theme.expense, SAVING = theme.saving;
  const navigation = useNavigation();
  const isDesktop = useIsDesktop();
  const { format, convert, formatIn, baseCurrency, currency: displayCurrency } = useCurrency();

  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('Mes');
  const [customRange, setCustomRange] = useState(null); // { start, end }
  const [rangeModalVisible, setRangeModalVisible] = useState(false);

  const { data: transactions = [], isLoading: isLoadingTransactions, error: transactionsError, refetch: refetchTransactions } = useGetTransactions();
  const { data: budgets = [], isLoading: isLoadingBudgets, error: budgetsError, refetch: refetchBudgets } = useGetBudgets();
  const { data: savings = [], isLoading: isLoadingSavings } = useGetSavings();

  const formattedDate = (date) => {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(date).toLocaleDateString('es-CO', options);
  };

  const filteredTransactions = useMemo(() => {
    const range = getDateRange(dateFilter, customRange);
    const searchTerm = searchQuery.toLowerCase();

    const filtered = transactions.filter(transaction => {
      if (!isWithinRange(transaction.date, range)) return false;

      const noteMatch = transaction.notes?.toLowerCase().includes(searchTerm);
      const amountMatch = transaction.amount.toString().includes(searchTerm);
      const typeMatch = transaction.type.toLowerCase().includes(searchTerm);
      return noteMatch || amountMatch || typeMatch;
    });

    return [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions, searchQuery, dateFilter, customRange]);

  // Totales del periodo seleccionado (proximidad: junto a la lista).
  const totals = useMemo(() => {
    let inc = 0;
    let exp = 0;
    filteredTransactions.forEach((t) => {
      const amt = convert(parseFloat(t.amount) || 0, t.currency || baseCurrency, baseCurrency);
      const type = t.type.toLowerCase();
      if (type === 'ingreso' && !t.is_advance) inc += amt;
      else if (type === 'gasto') exp += amt;
      else if (type === 'ahorro') {
        const s = savings.find((x) => x.id === t.budget_id);
        if (s && (s.showable === false || s.showable === undefined)) exp += amt;
      }
    });
    return { inc, exp, bal: inc - exp };
  }, [filteredTransactions, convert, baseCurrency, savings]);

  // Agrupa las transacciones (ya ordenadas) por día.
  const sections = useMemo(() => {
    const groups = [];
    let current = null;
    filteredTransactions.forEach((t) => {
      const key = new Date(t.date).toDateString();
      if (!current || current.key !== key) {
        current = { key, title: dayLabel(t.date), data: [] };
        groups.push(current);
      }
      current.data.push(t);
    });
    return groups;
  }, [filteredTransactions]);

  const categoryFor = (item) => {
    if (item.type === 'gasto') return budgets.find((b) => b.id === item.budget_id);
    if (item.type === 'ahorro') return savings.find((s) => s.id === item.budget_id);
    return { name: 'Cuenta principal', color: '#D9D9D9', icon: 'account-balance-wallet' };
  };

  const isLoading = isLoadingTransactions || isLoadingBudgets || isLoadingSavings;
  const error = transactionsError || budgetsError;

  if (isLoading) {
    return <ActivityIndicator size="large" style={{ flex: 1 }} />;
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text>Error: {error.message}</Text>
        <Button title="Reintentar" onPress={() => { refetchTransactions(); refetchBudgets(); }} />
      </View>
    );
  }

  const renderRow = ({ item }) => {
    const category = categoryFor(item);
    const name = category ? category.name : 'Cuenta principal';
    const color = category ? category.color : '#D9D9D9';
    const icon = category ? category.icon : 'account-balance-wallet';
    const type = item.type.toLowerCase();
    const sign = type === 'ingreso' ? '+' : '−';
    const amountColor = type === 'ingreso' ? INCOME : type === 'gasto' ? EXPENSE : SAVING;

    return (
      <TouchableOpacity
        style={styles.row}
        activeOpacity={0.6}
        onPress={() => navigation.navigate('SingleTransactionScreen', { transaction: item, categoryName: name, categoryColor: color, categoryIcon: icon })}
      >
        <View style={[styles.iconCircle, { backgroundColor: (color || '#D9D9D9') + '33' }]}>
          <MaterialIcons name={icon} size={20} color={color || '#5f6b62'} />
        </View>
        <View style={styles.rowInfo}>
          <View style={styles.rowNameWrap}>
            <Text style={styles.rowName} numberOfLines={1}>{name}</Text>
            {item.recurring_rule_id ? (
              <MaterialIcons name="repeat" size={14} color="#8a8a80" style={styles.rowRepeat} />
            ) : null}
          </View>
          {item.notes ? <Text style={styles.rowNote} numberOfLines={1}>{item.notes}</Text> : null}
        </View>
        <Text style={[styles.rowAmount, { color: amountColor }]}>
          {sign}{formatIn(item.amount, item.currency)}
          {item.currency && item.currency !== displayCurrency ? <Text style={styles.rowCurrency}> {item.currency}</Text> : null}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="receipt" size={48} color="#cdd1c5" />
      <Text style={styles.emptyText}>No hay transacciones en este periodo</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.content, isDesktop && styles.contentDesktop]}>
        <Text style={styles.title}>Historial</Text>

        <SearchInput
          placeholder="Buscar por categoría, monto, tipo..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
        />

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
            <MaterialIcons name="date-range" size={16} color={theme.textSecondary} />
            <Text style={styles.rangeChipText}>
              {formattedDate(customRange.start)} — {formattedDate(customRange.end)}
            </Text>
            <MaterialIcons name="edit" size={14} color={theme.textSecondary} />
          </TouchableOpacity>
        )}

        {/* Totales del periodo (proximidad) */}
        <View style={styles.totalsRow}>
          <View style={[styles.totalChip, { backgroundColor: theme.incomeSoft }]}>
            <Text style={[styles.totalLabel, { color: theme.income }]}>Ingresos</Text>
            <Text style={[styles.totalValue, { color: theme.incomeStrong }]} numberOfLines={1}>{format(totals.inc)}</Text>
          </View>
          <View style={[styles.totalChip, { backgroundColor: theme.expenseSoft }]}>
            <Text style={[styles.totalLabel, { color: theme.expense }]}>Egresos</Text>
            <Text style={[styles.totalValue, { color: theme.expenseStrong }]} numberOfLines={1}>{format(totals.exp)}</Text>
          </View>
          <View style={[styles.totalChip, { backgroundColor: theme.savingSoft }]}>
            <Text style={[styles.totalLabel, { color: theme.saving }]}>Balance</Text>
            <Text style={[styles.totalValue, { color: theme.savingStrong }]} numberOfLines={1}>{format(totals.bal)}</Text>
          </View>
        </View>

        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={renderRow}
          renderSectionHeader={({ section }) => <Text style={styles.dayLabel}>{section.title}</Text>}
          ListEmptyComponent={renderEmptyList}
          contentContainerStyle={styles.listContent}
          stickySectionHeadersEnabled={false}
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
    </View>
  );
};

const makeStyles = (t) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: t.background,
    alignItems: 'center',
  },
  content: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 16,
  },
  contentDesktop: {
    maxWidth: 860,
  },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: {
    fontSize: SIZES.font * 1.6,
    fontWeight: '600',
    color: t.textPrimary,
    marginTop: 16,
    marginBottom: 12,
  },
  searchInput: {
    width: '100%',
  },
  rangeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 6,
    backgroundColor: t.greenSoft,
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.padding * 0.75,
    paddingVertical: SIZES.padding * 0.4,
    marginBottom: 4,
  },
  rangeChipText: {
    fontSize: SIZES.font * 0.95,
    color: t.textSecondary,
    fontWeight: '600',
  },
  totalsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  totalChip: {
    flex: 1,
    borderRadius: SIZES.radius,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  totalLabel: { fontSize: SIZES.font * 0.8 },
  totalValue: { fontSize: SIZES.font * 1.05, fontWeight: '600', marginTop: 2 },
  listContent: {
    paddingBottom: 24,
    flexGrow: 1,
  },
  dayLabel: {
    fontSize: SIZES.font * 0.85,
    color: t.neutral,
    marginTop: 14,
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowInfo: { flex: 1 },
  rowNameWrap: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  rowRepeat: { marginTop: 1 },
  rowName: { fontSize: SIZES.font * 1.05, fontWeight: '500', color: t.textPrimary },
  rowNote: { fontSize: SIZES.font * 0.85, color: t.textSecondary, marginTop: 2 },
  rowCurrency: { fontSize: SIZES.font * 0.75, fontWeight: '600' },
  rowAmount: { fontSize: SIZES.font * 1.05, fontWeight: '600' },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: t.textSecondary,
    textAlign: 'center',
  },
});

export default TransactionHistoryScreen;
