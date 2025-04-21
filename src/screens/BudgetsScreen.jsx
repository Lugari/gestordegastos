import React, {useCallback} from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import BudgetProgressCard from '../components/budgets/BudgetProgressCard';
import BudgetCategory from '../components/budgets/BudgetCategory';
import FAB from '../components/FAB';

import { useBudgets } from '../hooks/useBudgets';


const BudgetsScreen = () => {

    
    const navigation = useNavigation();
    
    const { budgets, loading, error, reload } = useBudgets();
    
    useFocusEffect(
        useCallback(() => {
            reload();
        }, [])
    );

    const renderLoading = () => (
        <View style={styles.container}>
            <Text style={{fontSize: 18, fontWeight: 'bold'}}>Cargando...</Text>
        </View>
    );

    const renderEmpty = () => (
        <View style={styles.container}>
            <Text style={{fontSize: 18, fontWeight: 'bold'}}>No tienes presupuestos</Text>
            <Text onPress={()=> navigation.navigate('AddBudgetScreen')} style={{fontSize: 16, marginTop: 10}}>¡Agrega un presupuesto!</Text>
        </View>
    );

    const renderError = () => (
        <View style={styles.container}>
            <Text style={{fontSize: 18, fontWeight: 'bold'}}>Error al cargar los presupuestos</Text>
            <Text style={{fontSize: 16, marginTop: 10}}>Por favor, intenta de nuevo más tarde.</Text>
            <FAB onPress={()=> navigation.navigate('AddBudgetScreen')} />
        </View>
    );
    const renderBudgets = () => (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <BudgetProgressCard
                    title="Total"
                    used={budgets.map(b => b.used).reduce((a, b) => a + b, 0)}
                    total={budgets.map(b => b.total).reduce((a, b) => a + b, 0)}
                />
                {budgets.map((budget, index) => (
                    <TouchableOpacity key={index} onPress={() => navigation.navigate('SingleBudgetScreen', { budget })}>
                        <BudgetCategory
                            name={budget.name}
                            used={budget.used}
                            total={budget.total}
                            color={budget.selectedColor}
                        />
                    </TouchableOpacity>
                ))}
            </ScrollView>
            
            <FAB onPress={()=> navigation.navigate('AddBudgetScreen')} />

        </View>
    );

    if (loading) {
        return renderLoading();
    }
    if (error) {
        return renderError();
    }
    if (budgets.length === 0) {
        return renderEmpty();
    }
    if (budgets.length > 0) {
        return renderBudgets();
    }



    
    return (

        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <BudgetProgressCard

                    title="Total"
                    used={budgets.map(b => b.used).reduce((a, b) => a + b, 0)}
                    total={budgets.map(b => b.total).reduce((a, b) => a + b, 0)}

                />
                
                {budgets.map((budget, index) => (
                    renderBudgets()
                ))}
            </ScrollView>

            <AddTransactionButton onPress={()=> navigation.navigate('AddBudgetScreen')} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    scrollContainer: {
        padding: 16,
    },
});

export default BudgetsScreen;