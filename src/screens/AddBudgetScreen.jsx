import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AddBudgetForm from '../components/AddBudgetForm';

import { useBudgets } from '../hooks/useBudgets';

const AddBudgetScreen = () => {
  const navigation = useNavigation();

  const { addBudget } = useBudgets();

  const handleAddBudget = async (budgetData) => {
    try {
      const newBudget = await addBudget(budgetData);
      console.log('Nuevo presupuesto añadido:', newBudget);
      navigation.goBack();
    } catch (error) {
      console.error('Error al añadir presupuesto:', error);
    }
  }

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <AddBudgetForm onAdd={handleAddBudget} onCancel={handleCancel} />
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
