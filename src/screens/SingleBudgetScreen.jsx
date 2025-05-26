import React from 'react';
import { ScrollView, StyleSheet, View, Alert } from 'react-native';
import { useRoute } from '@react-navigation/native';
import SingleBudgetCard from '../components/budgets/SingleBudgetCard';

import { useNavigation } from '@react-navigation/native';

import { useManageBudgets } from '../hooks/useBudgetsData';

const SingleBudgetScreen = () => {

  const navigation = useNavigation();

  const { deleteBudget, isDeleting } = useManageBudgets();

  const route = useRoute();
  const { budget } = route.params;

  const handleDeletePress = async () => {
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
};


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
        onDelete={handleDeletePress}
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
