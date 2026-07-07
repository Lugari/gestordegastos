import React, { useCallback } from "react";
import AddTransactionForm from "../components/transactions/AddTransactionForm";

import { StyleSheet, ScrollView, View } from "react-native";

import { notify } from "../utils/notify";
import * as Recurring from "../services/recurringService";
import * as Cards from "../services/cardService";
import { useGetDebts } from "../hooks/useDebtsData";

import { useNavigation } from "@react-navigation/native";
import { useRoute } from "@react-navigation/native";

import { useIsDesktop } from "../hooks/useResponsive";
import { SIZES } from "../constants/theme";
import { useTheme } from "../context/ThemeContext";

import { useManageTransactions } from "../hooks/useTransactionData";
import { useGetBudgets, useManageBudgets } from "../hooks/useBudgetsData";
import { useGetSavings, useManageSavings} from "../hooks/useSavingsData"

const AddTransactionScreen = () => {

    const { theme } = useTheme();
    const styles = React.useMemo(() => makeStyles(theme), [theme]);

    const navigation = useNavigation();
    const isDesktop = useIsDesktop();

    const route = useRoute();
    const { transaction } = route.params || {};
    
    const { addTransaction, updateTransaction } = useManageTransactions();
    const { updateBudget } = useManageBudgets();
    const { updateSaving } = useManageSavings();

    const { data: budgets = [], isLoading: isLoadingBudgets, error: budgetsError, refetch: refetchBudgets } = useGetBudgets();
    const { data: savings = [], isLoading: isLoadingSavings, error: savingsError, refetch: refetchSavings } = useGetSavings();
    const { data: debts = [] } = useGetDebts();
    const handleCancel= () =>{ 
        navigation.goBack()
    }

    const handleSubmit = useCallback(async (formData)=>{
        try{
            // La recurrencia no se guarda dentro de la transacción: genera una regla aparte.
            const { recurrence, ...txData } = formData;

            if (!transaction) {
                // Compra con tarjeta: crea el plan de cuotas y sube la deuda.
                if (txData.card_id) {
                    const card = debts.find((d) => d.id === txData.card_id);
                    if (card) {
                        await addTransaction(txData);
                        await Cards.registerPurchase({
                            card,
                            amount: txData.amount,
                            currency: txData.currency,
                            installments: txData.installments,
                            notes: txData.notes,
                        });
                        navigation.goBack();
                        return;
                    }
                }
                if (recurrence) {
                    // La fecha de la transacción marca el INICIO de la recurrencia.
                    const startDay = Recurring.toDayString(new Date(txData.date));
                    const today = Recurring.toDayString(new Date());
                    const futureStart = startDay > today;
                    const { date, ...template } = txData; // la fecha la pone cada ocurrencia

                    // Si el inicio es futuro, hoy no se registra nada: el motor
                    // creará la primera ocurrencia al llegar esa fecha.
                    if (!futureStart) {
                        await addTransaction(txData);
                    }
                    await Recurring.addRule({ template, ...recurrence, startDay, firstOccurrencePending: futureStart });
                } else {
                    await addTransaction(txData);
                }
            }else{
                await updateTransaction({id: transaction.id, updates: txData});
            }

            // Éxito: volvemos a la pantalla desde la que se abrió el formulario.
            navigation.goBack();

        }catch (error) {
            console.error("Error en handleSubmit:", error);
            notify('No se pudo guardar', 'Ocurrió un error al guardar la transacción. Revisa tu conexión e inténtalo de nuevo.');
        }

    }, [addTransaction, updateTransaction, updateBudget, updateSaving, transaction, budgets, savings, debts, navigation])


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
const makeStyles = (t) => StyleSheet.create({
    container: {
        paddingVertical: 30,
        paddingHorizontal: 20,
        backgroundColor: t.background,
        flexGrow: 1,
    },
    desktopRoot: {
        flex: 1,
        backgroundColor: t.background,
    },
    desktopScroll: {
        alignItems: "center",
        paddingVertical: 40,
        paddingHorizontal: 20,
    },
    card: {
        width: "100%",
        maxWidth: 560,
        backgroundColor: t.card,
        borderRadius: SIZES.radius * 1.6,
        paddingHorizontal: SIZES.padding,
        paddingBottom: SIZES.padding,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 6 },
        shadowRadius: 20,
        elevation: 4,
    },
});
export default AddTransactionScreen;