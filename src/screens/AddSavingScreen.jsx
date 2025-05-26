import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import AddSavingForm from '../components/savings/AddSavingForm';
import { useNavigation } from '@react-navigation/native';

import {useManageSavings} from '../hooks/useSavingsData'

const AddSavingScreen = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const navigation = useNavigation();

  const {addSaving} = useManageSavings()

  const handleSubmit = async (data)=>{
    try{
      await addSaving(data)
      console.log("Añadiendo ahorro: ", data)

    }catch{
      console.log("Error al añadir ahorro", data)
    }
  }


  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={styles.container}>
        <AddSavingForm onSubmit={handleSubmit}/>
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