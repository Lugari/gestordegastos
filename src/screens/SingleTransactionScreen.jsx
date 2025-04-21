import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';

import { useTransactions } from '../hooks/useTransactions';
import { useBudgets } from '../hooks/useBudgets';

import { useNavigation } from '@react-navigation/native';


import SingleTransactionCard from '../components/transactions/SingleTransactionCard'; // ajusta la ruta si es necesario

const SingleTransactionScreen = () => {

  const route = useRoute();
  const { transaction, budgetName, budgetIcon, budgetColor } = route.params;

  const { deleteTransaction } = useTransactions();

  const { updateBudget, budgets } = useBudgets();

  const navigator = useNavigation();

  const handleDelete = async () => {
    try {
      const updatedBudget = budgets.find(b => b.id === transaction.budget_id);
      
      if (!updatedBudget) {
        await deleteTransaction(transaction.id);
        navigator.goBack();
        return;
      }
      
      updatedBudget.used -= transaction.amount;
      updatedBudget.updated_at = new Date().toISOString();
      await deleteTransaction(transaction.id);
      updateBudget(transaction.budget_id, updatedBudget);
      navigator.goBack();
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  }

  
 
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <SingleTransactionCard
        id={transaction.id}
        amount={transaction.amount}
        type={transaction.type}
        budget={budgetName}
        date={transaction.date}
        icon={budgetIcon}
        color={budgetColor}

        note={transaction.note}
        onEdit={() => console.log('Editar transacción')}
        onDelete={() => {handleDelete()}}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
});

export default SingleTransactionScreen;
