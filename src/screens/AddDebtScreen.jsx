import { useCallback, useEffect } from 'react';
import { ScrollView, View, StyleSheet, Alert } from 'react-native';
import AddDebtForm from '../components/debts/AddDebtForm';
import { useManageDebts } from '../hooks/useDebtsData';
import { useIsDesktop } from '../hooks/useResponsive';
import { COLORS, SIZES } from '../constants/theme';
import { useNavigation, useRoute } from '@react-navigation/native';

const AddDebtScreen = () => {
  const navigation = useNavigation();
  const isDesktop = useIsDesktop();
  const route = useRoute();
  const toEdit = route.params?.toEdit || null;

  useEffect(() => {
    const title = toEdit ? 'Editar Deuda' : 'Añadir Deuda';
    navigation.setOptions({ title });
  }, [navigation, toEdit]);

  const { addDebt, updateDebt } = useManageDebts();

  const handleSubmit = useCallback(async (data) => {
    try {
      if (toEdit) {
        await updateDebt({ id: toEdit.id, updates: data });
        console.log("Actualizando deuda: ", data);
      } else {
        await addDebt(data);
        console.log("Añadiendo deuda: ", data);
      }
      Alert.alert(
        'Éxito',
        toEdit ? 'Deuda actualizada correctamente.' : 'Deuda añadida correctamente.',
        [{ text: 'Aceptar', onPress: () => navigation.popTo('DebtsScreen') }],
      )
    } catch (e) {
      console.log("Error al añadir deuda", e);
    }
  }, [addDebt, updateDebt, toEdit, navigation]);

  const handleCancel = useCallback(() => {
    navigation.popTo('DebtsScreen');
  }, [navigation]);

  const formEl = (
    <AddDebtForm onSubmit={handleSubmit} toEdit={toEdit} onCancel={handleCancel} />
  );

  if (isDesktop) {
    return (
      <ScrollView style={styles.desktopRoot} contentContainerStyle={styles.desktopScroll}>
        <View style={styles.card}>{formEl}</View>
      </ScrollView>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <ScrollView contentContainerStyle={styles.container}>
        {formEl}
      </ScrollView>
    </View>
  );
}

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

export default AddDebtScreen;