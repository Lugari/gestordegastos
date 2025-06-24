import { ScrollView, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AddBudgetForm from '../components/budgets/AddBudgetForm';

import { useManageBudgets } from '../hooks/useBudgetsData';

import { useRoute } from '@react-navigation/native';

const AddBudgetScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const {addBudget, isAdding, updateBudget, isUpdating} = useManageBudgets()

  const { budgetToEdit } = route.params || {};

  const handleSubmit = async (formData) => {
    try {
      if (budgetToEdit) {
        await updateBudget({ id: budgetToEdit.id, updates: formData });
        Alert.alert('Éxito', 'Presupuesto actualizado correctamente.');
      } else {
        await addBudget(formData);
        Alert.alert('Éxito', 'Presupuesto añadido correctamente.');
      }
      navigation.goBack(); // Vuelve a la pantalla anterior tras el éxito
    } catch (error) {
      console.error("Error al guardar presupuesto:", error);
      Alert.alert('Error', 'No se pudo guardar el presupuesto.');
    }
  };

  const handleCancel = () => {
    navigation.goBack(); // Vuelve a la pantalla anterior sin guardar cambios
  };


  return (
    <ScrollView contentContainerStyle={styles.container}>
      <AddBudgetForm toEdit={budgetToEdit} onSubmit={handleSubmit} onCancel={handleCancel} />
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
