import React from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import BudgetProgressCard from '../components/budgets/BudgetProgressCard';
import BudgetCategory from '../components/budgets/BudgetCategory';
import FAB from '../components/FAB';
import PrimaryButton from '../components/PrimaryButton';

import { MaterialIcons } from '@expo/vector-icons';

import { useGetInvestments } from '../hooks/useInvestmentsData';
import { useIsDesktop } from '../hooks/useResponsive';
import { COLORS, SIZES } from '../constants/theme';

const InvestmentsScreen = () => {
    const navigation = useNavigation();
    const isDesktop = useIsDesktop();

    const { data: investments = [], isLoading, error } = useGetInvestments();

    const renderInvestments = () => (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={[styles.scrollContainer, isDesktop && styles.scrollContainerDesktop]}>
                <BudgetProgressCard
                    title="Total"
                    used={investments.map(i => i.used).reduce((a, b) => a + b, 0)}
                    total={investments.map(i => i.total).reduce((a, b) => a + b, 0)}
                    color={COLORS.primary}
                />
                {investments.map((investment, index) => (
                    <TouchableOpacity key={index} onPress={() => navigation.navigate('SingleInvestmentScreen', { investment })}>
                        <BudgetCategory
                            name={investment.name}
                            used={investment.used}
                            total={investment.total}
                            color={investment.color}
                        />
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <FAB onPress={() => navigation.navigate('AddInvestmentScreen')} />
        </View>
    );

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <MaterialIcons name="trending-up" size={48} color="#cdd1c5" />
            <Text style={styles.emptyText}>No hay inversiones registradas</Text>
            <PrimaryButton onPress={() => navigation.navigate('AddInvestmentScreen')} title="Agregar Inversión" />
        </View>
    );

    if (isLoading) {
        return (
            <View style={styles.container}>
                <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Cargando tus inversiones...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.container}>
                <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Error al cargar los datos</Text>
            </View>
        );
    }

    if (investments.length === 0) {
        return renderEmpty();
    }

    return renderInvestments();
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    scrollContainer: {
        padding: SIZES.padding,
    },
    scrollContainerDesktop: {
        width: '100%',
        maxWidth: 760,
        alignSelf: 'center',
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

export default InvestmentsScreen;
