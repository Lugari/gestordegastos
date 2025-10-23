import React from "react";
import { View, ScrollView, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import DebtCard from '../components/debts/DebtCard';
import FAB from '../components/FAB';
import PrimaryButton from '../components/PrimaryButton';
import { MaterialIcons } from '@expo/vector-icons';
import { useGetDebts } from "../hooks/useDebtsData";
import { COLORS, SIZES } from "../constants/theme";

const DebtsScreen = () => {
    const navigation = useNavigation();
    const { data: debts = [], isLoading: isLoadingDebts, error: debtsError } = useGetDebts();

    const renderDebts = () => (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {debts.map((debt, index) => (
                    <TouchableOpacity key={index} onPress={() => navigation.navigate('SingleDebtScreen', { debt })}>
                        <DebtCard
                            name={debt.name}
                            total={debt.total}
                        />
                    </TouchableOpacity>
                ))}
            </ScrollView>
            <FAB onPress={() => navigation.navigate('AddDebtScreen')} />
        </View>
    );

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <MaterialIcons name="credit-card-off" size={48} color="#cdd1c5" />
            <Text style={styles.emptyText}>No hay deudas programadas</Text>
            <PrimaryButton onPress={() => navigation.navigate('AddDebtScreen')} title="Agregar Deuda" />
        </View>
    );

    const renderLoading = () => (
        <View style={styles.container}>
            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Cargando tus deudas...</Text>
        </View>
    );

    const renderError = () => (
        <View style={styles.container}>
            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Error al cargar los datos</Text>
        </View>
    );

    if (isLoadingDebts) {
        return renderLoading();
    }

    if (debtsError) {
        return renderError();
    }

    if (debts.length === 0) {
        return renderEmpty();
    }

    return renderDebts();
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

export default DebtsScreen;