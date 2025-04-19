import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';

import { useTransactions } from '../hooks/useTransactions';
import { useBudgets } from '../hooks/useBudgets';

import { useNavigation } from '@react-navigation/native';


import SingleTransactionCard from '../components/SingleTransactionCard'; // ajusta la ruta si es necesario

const SingleTransactionScreen = () => {

  const route = useRoute();
  const { transaction, budgetName, budgetIcon, budgetColor } = route.params;

  const { deleteTransaction } = useTransactions();

  const { update } = useBudgets();

  const navigator = useNavigation();
  
 
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
        onDelete={() => {
          deleteTransaction(transaction.id)

          navigator.goBack();
          }}
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
