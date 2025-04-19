import React from "react";

import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import BudgetProgressCard from '../components/BudgetProgressCard';
import BudgetCategory from '../components/BudgetCategory';
import FAB from '../components/FAB';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

const SavingsScreen = () => {

    const navigation = useNavigation();
    const { colors } = useTheme();
    const { t } = useTranslation();

    const savings = [
        {name: "Fondo de Emergencia", current: 120000, total:200000, color:"#3498db", startDate: "2023-01-01", lastUpdate: "2023-01-15", deadline:"2023-02-28", description: "Ahorros para emergencias", period: "Mensual"},
        {name: "Viaje a Europa", current: 80000, total:150000, color:"#e74c3c", startDate: "2023-01-01", lastUpdate: "2023-01-15", deadline:"2023-02-28", description: "Ahorros para viaje a Europa", period: "Mensual"},
        {name: "Compra de Auto", current: 50000, total:100000, color:"#2ecc71", startDate: "2023-01-01", lastUpdate: "2023-01-15", deadline:"2023-02-28", description: "Ahorros para compra de auto", period: "Mensual"},
        {name: "Boda", current: 30000, total:50000, color:"#f1c40f", startDate: "2023-01-01", lastUpdate: "2023-01-15", deadline:"2023-02-28", description: "Ahorros para boda", period: "Mensual"},
        {name: "Estudios en el Extranjero", current: 20000, total:30000, color:"#9b59b6", startDate: "2023-01-01", lastUpdate: "2023-01-15", deadline:"2023-02-28", description: "Ahorros para estudios en el extranjero", period: "Mensual"},
      ]
    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <BudgetProgressCard
                    title={t('Total')}
                    current={savings.map(b => b.current).reduce((a, b) => a + b, 0)}
                    total={savings.map(b => b.total).reduce((a, b) => a + b, 0)}
                />
                
                {savings.map((saving, index) => (
                    <TouchableOpacity key={index} onPress={() => navigation.navigate('SingleSavingScreen', { saving })}>
                        <BudgetCategory
                            color={saving.color}
                            key={index}
                            name={saving.name}
                            current={saving.current}
                            total={saving.total}
                        />
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <FAB onPress={()=> navigation.navigate('AddSavingScreen')} />
        </View>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    scrollContainer: {
        padding: 16,
    },
});
export default SavingsScreen;