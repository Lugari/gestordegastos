import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import AddSavingForm from '../components/AddSavingForm';
import { useNavigation } from '@react-navigation/native';

const AddSavingScreen = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={styles.container}>
        <AddSavingForm onSubmit={() => navigation.goBack()} />
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