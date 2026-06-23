import { useCallback, useEffect } from 'react';

import { ScrollView, View, StyleSheet, Alert } from 'react-native';
import AddSavingForm from '../components/savings/AddSavingForm';

import {useManageSavings} from '../hooks/useSavingsData'
import { useIsDesktop } from '../hooks/useResponsive';
import { COLORS, SIZES } from '../constants/theme';

import { useNavigation } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';

const AddSavingScreen = () => {

  const navigation = useNavigation();
  const isDesktop = useIsDesktop();
  const route = useRoute();

  const toEdit = route.params?.toEdit || null;

  useEffect(() => {
    const title = toEdit ? 'Editar Ahorro' : 'Añadir Ahorro';
    navigation.setOptions({ title });
  }, [navigation, toEdit]);

  const {addSaving, updateSaving} = useManageSavings()

  const handleSubmit = useCallback(async (data)=>{
    try{
      if (toEdit) {
        await updateSaving({ id: toEdit.id, updates: data})
        console.log ("Actualizando ahorro: ", data)
      }else {
        await addSaving(data)
        console.log("Añadiendo ahorro: ", data)
      }
      Alert.alert(
        'Éxito',
        toEdit ? 'Ahorro actualizado correctamente.' : 'Ahorro añadido correctamente.',
        [{ text: 'Aceptar', onPress: () => navigation.popTo('SavingsScreen') }],
      )
    }catch(e){
      console.log("Error al añadir ahorro", e)
    }
  }, [addSaving, updateSaving, toEdit, navigation])

  const handleCancel = useCallback(()=>{
    navigation.popTo('SavingsScreen')
  })


  const formEl = (
    <AddSavingForm onSubmit={handleSubmit} toEdit={toEdit} onCancel={handleCancel}/>
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
export default AddSavingScreen;