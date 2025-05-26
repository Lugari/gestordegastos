import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import SingleSavingCard from '../components/savings/SingleSavingCard';
import FAB from '../components/FAB';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';

import { useManageSavings } from '../hooks/useSavingsData';

const SingleSavingScreen = () => {
    const route = useRoute();
    const { colors } = useTheme();
    const { t } = useTranslation()

    const navigation = useNavigation();
    
    const {deleteSaving} = useManageSavings()
    const { saving } = route.params;

    const handleDelete = async ()=>{
        try{
            await deleteSaving(saving.id)
            navigation.goBack()
            console.log("Ahorro eliminado:", saving.name)
        }catch{
            console.log("Error al eliminar ahorro")
        }
    }
    
    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
        <ScrollView contentContainerStyle={styles.content}>
        <SingleSavingCard
            saving={saving}
            onEdit={() => console.log('Editar ahorro')}
            onDelete={handleDelete}
        />
        <View style={{ paddingVertical: 24 }}>
        </View>
        </ScrollView>
        <FAB onPress={() => navigation.navigate('AddTransactionScreen', { transactionType: 'ahorro' })} />
        </View>
    
    );
    }
const styles = StyleSheet.create({
    content: {
        paddingVertical: 24,
        paddingHorizontal: 16,
        backgroundColor: '#ffffff',
        flexGrow: 1,
    },
});
export default SingleSavingScreen;