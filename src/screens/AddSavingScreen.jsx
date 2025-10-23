import { useCallback, useEffect } from 'react';

import { ScrollView, View, StyleSheet, Alert } from 'react-native';
import AddSavingForm from '../components/savings/AddSavingForm';

import {useManageSavings} from '../hooks/useSavingsData'

import { useNavigation } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';

const AddSavingScreen = () => {

  const navigation = useNavigation();
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


  return (
    <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <ScrollView contentContainerStyle={styles.container}>
        <AddSavingForm onSubmit={handleSubmit} toEdit={toEdit} onCancel={handleCancel}/>
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
});
export default AddSavingScreen;