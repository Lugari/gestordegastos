import { useCallback, useEffect } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

import { notify } from '../utils/notify';

import AddBudgetForm from '../components/budgets/AddBudgetForm';
import AddSavingForm from '../components/savings/AddSavingForm';
import AddDebtForm from '../components/debts/AddDebtForm';
import AddInvestmentForm from '../components/investments/AddInvestmentForm';

import { useManageBuckets } from '../hooks/useBucketData';
import { useIsDesktop } from '../hooks/useResponsive';
import { KIND } from '../constants/bucketKinds';
import { COLORS, SIZES } from '../constants/theme';

// Pantalla de alta/edición única para todos los kinds. Reemplaza a los wrappers
// AddBudget/AddSaving/AddDebt/AddInvestmentScreen. Se parametriza con `kind`
// (initialParams), conservando los mismos nombres de ruta.
const CONFIG = {
  [KIND.BUDGET]: { queryKey: ['budgets'], Form: AddBudgetForm, list: 'BudgetsScreen', label: 'presupuesto' },
  [KIND.SAVING]: { queryKey: ['savings'], Form: AddSavingForm, list: 'SavingsScreen', label: 'ahorro' },
  [KIND.DEBT]: { queryKey: ['debts'], Form: AddDebtForm, list: 'DebtsScreen', label: 'deuda' },
  [KIND.INVESTMENT]: { queryKey: ['investments'], Form: AddInvestmentForm, list: 'InvestmentsScreen', label: 'inversión' },
};

const AddBucketScreen = () => {
  const navigation = useNavigation();
  const isDesktop = useIsDesktop();
  const route = useRoute();

  const { kind } = route.params || {};
  const cfg = CONFIG[kind];
  // Compatibilidad: presupuestos navegaban con `budgetToEdit`, el resto con `toEdit`.
  const toEdit = route.params?.toEdit ?? route.params?.budgetToEdit ?? null;

  const { addMutation, updateMutation } = useManageBuckets(kind, cfg?.queryKey ?? ['buckets', kind]);

  useEffect(() => {
    navigation.setOptions({ title: `${toEdit ? 'Editar' : 'Añadir'} ${cfg?.label ?? ''}`.trim() });
  }, [navigation, toEdit, cfg]);

  const handleSubmit = useCallback(async (data) => {
    try {
      if (toEdit) {
        await updateMutation.mutateAsync({ id: toEdit.id, updates: data });
      } else {
        await addMutation.mutateAsync(data);
      }
      // Éxito: volvemos a la lista directamente (el resultado se ve allí).
      navigation.popTo(cfg.list);
    } catch (e) {
      notify('No se pudo guardar', `Ocurrió un error al guardar ${cfg.label}. Revisa tu conexión e inténtalo de nuevo.`);
    }
  }, [toEdit, updateMutation, addMutation, cfg, navigation]);

  const handleCancel = useCallback(() => navigation.popTo(cfg.list), [navigation, cfg]);

  if (!cfg) return null;

  const Form = cfg.Form;
  const formEl = <Form toEdit={toEdit} onSubmit={handleSubmit} onCancel={handleCancel} />;

  if (isDesktop) {
    return (
      <ScrollView style={styles.desktopRoot} contentContainerStyle={styles.desktopScroll}>
        <View style={styles.card}>{formEl}</View>
      </ScrollView>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <ScrollView contentContainerStyle={styles.container}>{formEl}</ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 24,
    paddingHorizontal: 16,
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

export default AddBucketScreen;
