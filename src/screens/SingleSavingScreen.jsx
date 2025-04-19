import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import SingleSavingCard from '../components/SingleSavingCard';
import AddTransactionButton from '../components/FAB';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';

const SingleSavingScreen = () => {
    const route = useRoute();
    const { colors } = useTheme();
    const { t } = useTranslation();
    const navigation = useNavigation();
    
    const { saving } = route.params;
    
    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
        <ScrollView contentContainerStyle={styles.content}>
        <SingleSavingCard
            title={saving.name}
            current={saving.current}
            total={saving.total}
            color={saving.color}
            period={saving.period}
            startDate={saving.startDate}
            lastUpdate={saving.lastUpdate}
            deadline={saving.deadline}
            description={saving.description}
            onEdit={() => console.log('Editar ahorro')}
            onDelete={() => console.log('Eliminar ahorro')}
        />
        <View style={{ paddingVertical: 24 }}>
        </View>
        </ScrollView>
        <AddTransactionButton onPress={() => navigation.navigate('AddTransactionScreen', { transactionType: 'Ingreso' })} />
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