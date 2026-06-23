import { ScrollView, View, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AddBudgetForm from '../components/budgets/AddBudgetForm';

import { useManageBudgets } from '../hooks/useBudgetsData';
import { useIsDesktop } from '../hooks/useResponsive';
import { COLORS, SIZES } from '../constants/theme';

import { useRoute } from '@react-navigation/native';
import { useCallback } from 'react';

const AddBudgetScreen = () => {
  const navigation = useNavigation();
  const isDesktop = useIsDesktop();
  const route = useRoute();

  const {addBudget, isAdding, updateBudget, isUpdating} = useManageBudgets()

  const { budgetToEdit } = route.params || {};

  const handleSubmit = useCallback(async (formData) => {
    try {
      if (budgetToEdit) {
        await updateBudget({ id: budgetToEdit.id, updates: formData });
        console.log("Actualizando presupuesto:", formData);
      } else {
        await addBudget(formData)
        console.log("Añadiendo presupuesto:", formData)
      }
      Alert.alert(
        'Éxito',
        budgetToEdit ? 'Presupuesto actualizado correctamente.' : 'Presupuesto añadido correctamente.',
        [{ text: 'Aceptar', onPress: () => navigation.popTo('BudgetsScreen') }],
      )
    } catch (error) {
      console.error("Error al guardar presupuesto:", error);
      Alert.alert('Error', 'No se pudo guardar el presupuesto.');
    }
  }, [addBudget, updateBudget, budgetToEdit, navigation])

  const handleCancel = useCallback(() => {
    navigation.goBack(); // Vuelve a la pantalla anterior sin guardar cambios
  }, [navigation]);


  const formEl = (
    <AddBudgetForm toEdit={budgetToEdit} onSubmit={handleSubmit} onCancel={handleCancel} />
  );

  if (isDesktop) {
    return (
      <ScrollView style={styles.desktopRoot} contentContainerStyle={styles.desktopScroll}>
        <View style={styles.card}>{formEl}</View>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {formEl}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
    backgroundColor: '#ffffff',
    flexGrow: 1,
  },
  desktopRoot: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  desktopScroll: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  card: {
    width: '100%',
    maxWidth: 560,
    backgroundColor: '#fff',
    borderRadius: SIZES.radius * 1.6,
    paddingHorizontal: SIZES.padding,
    paddingBottom: SIZES.padding,
    shadowColor: COLORS.textPrimary,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 20,
    elevation: 4,
  },
});

export default AddBudgetScreen;
