import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AddBudgetForm from '../components/budgets/AddBudgetForm';

import { useManageBudgets } from '../hooks/useBudgetsData';

const AddBudgetScreen = () => {
  const navigation = useNavigation();

  const {addBudget, isAdding} = useManageBudgets


  return (
    <ScrollView contentContainerStyle={styles.container}>
      <AddBudgetForm/>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
    backgroundColor: '#ffffff',
    flexGrow: 1,
  },
});

export default AddBudgetScreen;
