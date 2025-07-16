import {useCallback, useMemo} from 'react';
import { ScrollView, StyleSheet, View, Alert, FlatList } from 'react-native';

import SingleBudgetCard from '../components/budgets/SingleBudgetCard';
import TransactionCard from '../components/transactions/TransactionCard'

import { useRoute } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';

import { useManageBudgets } from '../hooks/useBudgetsData';
import { useGetTransactions } from '../hooks/useTransactionData';

const SingleBudgetScreen = () => {

  const navigation = useNavigation();
  const route = useRoute();

  const { deleteBudget, isDeleting } = useManageBudgets();
  const { data: transactions = [] } = useGetTransactions();

  const { budget } = route.params;

  const showTransactions = useMemo(() => transactions.filter(b => b.budget_id === budget.id).sort((a, b) => new Date(b.date) - new Date(a.date)),
  
  [transactions, budget.id])

  const handleDeletePress = useCallback(async () => {
    Alert.alert(
      "Eliminar presupuesto",
      `¿Estás seguro de que quieres eliminar el presupuesto "${budget.name}"?\n\nEsta acción no se puede deshacer.`,
      [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Eliminar",
            style: "destructive",
            onPress: async () => { 
              try {
                console.log(`Intentando eliminar presupuesto ID: ${budget.id}`);
                await deleteBudget(budget.id); 
                Alert.alert("Éxito", "Presupuesto eliminado.");
                navigation.goBack(); 
              } catch (error) {
                console.error("Error al eliminar presupuesto:", error);
                Alert.alert("Error", "No se pudo eliminar el presupuesto.");
              }
            }
          }
      ]
    );
}, [budget, deleteBudget, navigation]);

const handleEditPress = useCallback(() =>{

  navigation.navigate('AddBudgetScreen', { budgetToEdit: budget });

}, [budget, navigation]);


  return (
      
      <FlatList 
        style={styles.container}
        data= {showTransactions}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <SingleBudgetCard
            name={budget.name}
            used={budget.used}
            total={budget.total}
            color={budget.color}
            period={budget.period}
            date={budget.date}
            lastUpdate={budget.updated_at}
            notes={budget.notes}
            onEdit={handleEditPress}
            onDelete={handleDeletePress}
          />
        }
        renderItem={({item}) => (
          <TransactionCard
            name={budget.name}
            date={new Date(item.date).toLocaleDateString('es-CO')}
            amount={item.amount}
            type={item.type}
            icon={budget.icon}
            color={budget.color}
          />
        )}
        >

      </FlatList>
    
  );
};

const styles = StyleSheet.create({
  content: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    flexGrow: 1,
  },
});

export default SingleBudgetScreen;
