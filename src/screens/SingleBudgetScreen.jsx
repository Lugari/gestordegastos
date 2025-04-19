import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import SingleBudgetCard from '../components/SingleBudgetCard';

import { useNavigation } from '@react-navigation/native';

import { useBudgets } from '../hooks/useBudgets';

const SingleBudgetScreen = () => {

    const navigator = useNavigation();

  const { deleteBudget } = useBudgets();



    const route = useRoute();
  const { budget } = route.params;


  return (
    <ScrollView contentContainerStyle={styles.content}>

      <SingleBudgetCard
        name={budget.name}
        used={budget.used}
        total={budget.total}
        color={budget.selectedColor}
        period={budget.period}
        date={budget.date}
        lastUpdate={budget.updated_at}
        notes={budget.notes}
        onEdit={() => console.log('Editar presupuesto')}
        onDelete={() => deleteBudget(budget.id) && navigator.goBack()}
      />
    </ScrollView>
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
