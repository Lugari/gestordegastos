import React, {useState, useMemo} from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import BudgetProgressCard from '../components/budgets/BudgetProgressCard';
import BudgetCategory from '../components/budgets/BudgetCategory';
import FAB from '../components/FAB';
import PrimaryButton from '../components/PrimaryButton';
import {SIZES, COLORS} from '../constants/theme';

import { MaterialIcons } from '@expo/vector-icons';

import { useGetBudgets } from '../hooks/useBudgetsData';




const BudgetsScreen = () => {
    
    const navigation = useNavigation();

    const { data: budgets = [], isLoading: isLoadingBudgets, error: budgetsError, refetch: refetchBudgets } = useGetBudgets();

    const isLoading = isLoadingBudgets;
    const error = budgetsError;
    
    const renderLoading = () => (
        <View style={styles.container}>
            <Text style={{fontSize: 18, fontWeight: 'bold'}}>Cargando...</Text>
        </View>
    );

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <MaterialIcons name="wallet" size={48} color={"#cdd1c5"} />
            <Text style={styles.emptyText}>No hay presupestos registrados</Text>
            <PrimaryButton onPress={()=> navigation.navigate('AddBudgetScreen')} title="Agregar Presupuesto"  />
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
                    color={COLORS.primary}
                />
                {budgets.map((budget, index) => (
                    <TouchableOpacity key={index} onPress={() => navigation.navigate('SingleBudgetScreen', { budget })}>
                        <BudgetCategory
                            name={budget.name}
                            used={budget.used}
                            total={budget.total}
                            color={budget.color}
                        />
                    </TouchableOpacity>
                ))}
            </ScrollView>
            
            <FAB onPress={()=> navigation.navigate('AddBudgetScreen')} />

        </View>
    );

    if (isLoading) {
        return renderLoading();
    }
    if (error) {
        return renderError();
    }
    if (budgets.length === 0) {
        return renderEmpty();
    }

    return renderBudgets()


};

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
        padding: SIZES.padding * 2,
        gap: 14,
      },
      emptyText: {
        fontSize: SIZES.font,
        color: COLORS.textSecondary,
        textAlign: 'center',
      },
});

export default BudgetsScreen;