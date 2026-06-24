import { useCallback, useEffect } from 'react';
import { ScrollView, View, StyleSheet, Alert } from 'react-native';
import AddInvestmentForm from '../components/investments/AddInvestmentForm';

import { useManageInvestments } from '../hooks/useInvestmentsData';
import { useIsDesktop } from '../hooks/useResponsive';
import { COLORS, SIZES } from '../constants/theme';

import { useNavigation, useRoute } from '@react-navigation/native';

const AddInvestmentScreen = () => {
  const navigation = useNavigation();
  const isDesktop = useIsDesktop();
  const route = useRoute();

  const toEdit = route.params?.toEdit || null;

  useEffect(() => {
    navigation.setOptions({ title: toEdit ? 'Editar Inversión' : 'Añadir Inversión' });
  }, [navigation, toEdit]);

  const { addInvestment, updateInvestment } = useManageInvestments();

  const handleSubmit = useCallback(async (data) => {
    try {
      if (toEdit) {
        await updateInvestment({ id: toEdit.id, updates: data });
      } else {
        await addInvestment(data);
      }
      Alert.alert(
        'Éxito',
        toEdit ? 'Inversión actualizada correctamente.' : 'Inversión añadida correctamente.',
        [{ text: 'Aceptar', onPress: () => navigation.popTo('InvestmentsScreen') }],
      );
    } catch (e) {
      console.log('Error al guardar inversión', e);
    }
  }, [addInvestment, updateInvestment, toEdit, navigation]);

  const handleCancel = useCallback(() => navigation.popTo('InvestmentsScreen'), [navigation]);

  const formEl = (
    <AddInvestmentForm onSubmit={handleSubmit} toEdit={toEdit} onCancel={handleCancel} />
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

export default AddInvestmentScreen;
