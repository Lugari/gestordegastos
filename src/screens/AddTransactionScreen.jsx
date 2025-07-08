import { useCallback } from "react";
import AddTransactionForm from "../components/transactions/AddTransactionForm";  

import { StyleSheet, ScrollView, Alert } from "react-native";

import { useNavigation } from "@react-navigation/native";
import { useRoute } from "@react-navigation/native";

import { useManageTransactions } from "../hooks/useTransactionData";
import { useGetBudgets, useManageBudgets } from "../hooks/useBudgetsData";
import { useGetSavings, useManageSavings} from "../hooks/useSavingsData"

const AddTransactionScreen = () => {

    const navigation = useNavigation();

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

            Alert.alert(
                'Éxito',
                transaction ? 'Transacción actualizado correctamente.' : 'transacción añadido correctamente.',
                [{ text: 'Aceptar', onPress: () => navigation.popTo('TransactionHistoryScreen') }],
            )            
            
        }catch (error) {
            console.error("Error en handleSubmit:", error);
            alert('Error', 'No se pudo guardar la transacción o actualizar el presupuesto.');
        }

    }, [addTransaction, updateTransaction, updateBudget, updateSaving, transaction, budgets, savings, navigation])


    return (
        <ScrollView contentContainerStyle={styles.container}>
        <AddTransactionForm transactionToEdit={transaction} onCancel={handleCancel} onSubmit={handleSubmit} budgets={budgets} savings={savings}/>
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
});
export default AddTransactionScreen;