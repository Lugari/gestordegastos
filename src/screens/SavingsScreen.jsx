import React from "react";

import { View, ScrollView, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useNavigation, useTheme } from '@react-navigation/native';

import BudgetProgressCard from '../components/budgets/BudgetProgressCard';
import BudgetCategory from '../components/budgets/BudgetCategory';
import FAB from '../components/FAB';
import PrimaryButton from '../components/PrimaryButton';

import { MaterialIcons } from '@expo/vector-icons';

import { useGetSavings } from "../hooks/useSavingsData";

import { useTranslation } from 'react-i18next';
import { COLORS, SIZES } from "../constants/theme";

const SavingsScreen = () => {

    const navigation = useNavigation();
    const { colors } = useTheme();
    const { t } = useTranslation();

    const {data: savings = [], isLoading: isLoadingSavings, error: savingsError} = useGetSavings();

    const renderSavings = () => (
            <View style={styles.container}>
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    <BudgetProgressCard
                        title="Total"
                        used={savings.map(b => b.used).reduce((a, b) => a + b, 0)}
                        total={savings.map(b => b.total).reduce((a, b) => a + b, 0)}
                        color={COLORS.primary}
                    />
                    {savings.map((saving, index) => (
                        <TouchableOpacity key={index} onPress={() => navigation.navigate('SingleSavingScreen', { saving })}>
                            <BudgetCategory
                                name={saving.name}
                                used={saving.used}
                                total={saving.total}
                                color={saving.color}
                            />
                        </TouchableOpacity>
                    ))}
                </ScrollView>
                
                <FAB onPress={()=> navigation.navigate('AddSavingScreen')} />
    
            </View>
        ); 
    

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <MaterialIcons name="savings" size={48} color="#cdd1c5" />
            <Text style={styles.emptyText}>No hay ahorros programados</Text>
            <PrimaryButton onPress={()=> navigation.navigate('AddSavingScreen')} title="Agregar ahorro"  />
        </View>
    );

    const renderLoading = () => (

        <View style={styles.container}>
            <Text style={{fontSize: 18, fontWeight: 'bold'}}>Cargando tus ahorros...</Text> 
        </View>
    );
    const renderError = () => (

        <View style={styles.container}>
            <Text style={{fontSize: 18, fontWeight: 'bold'}}>Error al cargar los datos</Text> 
        </View>
    );

    if (isLoadingSavings){
        return renderLoading()
    }

    if (savingsError){
        return renderError()
    }

    if (savings.length === 0) {
        return renderEmpty();
    }

    return renderSavings()

    
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    scrollContainer: {
        padding: SIZES.padding,
    },
    emptyContainer: {
        backgroundColor: COLORS.background,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SIZES.padding * 2.2,
        gap: 14,
      },
      emptyText: {
        fontSize: SIZES.font * 1.1,
        color: COLORS.textSecondary,
        textAlign: 'center',
      },
});
export default SavingsScreen;