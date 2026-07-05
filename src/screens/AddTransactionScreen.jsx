import { useCallback } from "react";
import AddTransactionForm from "../components/transactions/AddTransactionForm";

import { StyleSheet, ScrollView, View } from "react-native";

import { notify } from "../utils/notify";

import { useNavigation } from "@react-navigation/native";
import { useRoute } from "@react-navigation/native";

import { useIsDesktop } from "../hooks/useResponsive";
import { COLORS, SIZES } from "../constants/theme";

import { useManageTransactions } from "../hooks/useTransactionData";
import { useGetBudgets, useManageBudgets } from "../hooks/useBudgetsData";
import { useGetSavings, useManageSavings} from "../hooks/useSavingsData"

const AddTransactionScreen = () => {

    const navigation = useNavigation();
    const isDesktop = useIsDesktop();

    const route = useRoute();
    const { transaction } = route.params || {};
    
    const { addTransaction, updateTransaction } = useManageTransactions();
    const { updateBudget } = useManageBudgets();
    const { updateSaving } = useManageSavings();

    const { data: budgets = [], isLoading: isLoadingBudgets, error: budgetsError, refetch: refetchBudgets } = useGetBudgets();
    const { data: savings = [], isLoading: isLoadingSavings, error: savingsError, refetch: refetchSavings } = useGetSavings();
    const handleCancel= () =>{ 
        navigation.goBack()
    }

    const handleSubmit = useCallback(async (formData)=>{
        try{  

            if (!transaction) {
                await addTransaction(formData);
            }else{
                await updateTransaction({id: transaction.id, updates: formData});
            }

            // Éxito: volvemos al historial directamente (el resultado se ve allí).
            // La pantalla vive en el stack raíz; el historial es una pestaña anidada en MainTabs.
            navigation.navigate('MainTabs', { screen: 'TransactionHistoryScreen' });

        }catch (error) {
            console.error("Error en handleSubmit:", error);
            notify('No se pudo guardar', 'Ocurrió un error al guardar la transacción. Revisa tu conexión e inténtalo de nuevo.');
        }

    }, [addTransaction, updateTransaction, updateBudget, updateSaving, transaction, budgets, savings, navigation])


    const formEl = (
        <AddTransactionForm transactionToEdit={transaction} onCancel={handleCancel} onSubmit={handleSubmit} budgets={budgets} savings={savings}/>
    );

    if (isDesktop) {
        return (
            <ScrollView style={styles.desktopRoot} contentContainerStyle={styles.desktopScroll}>
                <View style={styles.card}>
                    {formEl}
                </View>
            </ScrollView>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
        {formEl}
        </ScrollView>
    );
    }
const styles = StyleSheet.create({
    container: {
        paddingVertical: 30,
        paddingHorizontal: 20,
        backgroundColor: "#fff",
        flexGrow: 1,
    },
    desktopRoot: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    desktopScroll: {
        alignItems: "center",
        paddingVertical: 40,
        paddingHorizontal: 20,
    },
    card: {
        width: "100%",
        maxWidth: 560,
        backgroundColor: "#fff",
        borderRadius: SIZES.radius * 1.6,
        paddingHorizontal: SIZES.padding,
        paddingBottom: SIZES.padding,
        shadowColor: COLORS.textPrimary,
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 6 },
        shadowRadius: 20,
        elevation: 4,
    },
});
export default AddTransactionScreen;