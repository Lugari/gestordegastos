import AddTransactionForm from "../components/transactions/AddTransactionForm";  

import { StyleSheet, ScrollView } from "react-native";

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

    const handleSubmit = async (formData)=>{
        try{  

            if (!transaction) {
                await addTransaction(formData);
            }else{
                await updateTransaction({id: transaction.id, updates: formData});
            }
            if(formData.type.toLowerCase() === 'gasto'){
                if (formData.budget_id){
                    const usedBudget = budgets.find(b => b.id === formData.budget_id)
                    
                if (usedBudget) {
                    if(transaction){
                        usedBudget.used -= parseFloat(transaction.amount);
                    }
                    usedBudget.used += parseFloat(formData.amount);
                    await updateBudget({id: formData.budget_id, updates: {used: usedBudget.used}});
                }else{
                    console.warn(`Presupuesto ${formData.budget_id} no encontrado en la lista actual.`);
                }}
            }else if (formData.type.toLowerCase() === 'ahorro'){
                const savedTransaction = savings.find(s => s.id === formData.budget_id)
                console.log("Transacción de ahorro:", savedTransaction);
                
                if (savedTransaction){
                    if(transaction){
                        savedTransaction.used -= parseFloat(transaction.amount);
                        console.log("Transacción editada, monto usado anterior:", savedTransaction.used);
                    }
                    savedTransaction.used += parseFloat(formData.amount);
                    await updateSaving({id: formData.budget_id, updates: {used: savedTransaction.used}});
                    console.log("Transacción editada, monto usado nuevo:", savedTransaction.used);
                }else{
                    console.warn(`Ahorro ${formData.budget_id} no encontrado en la lista actual.`);
                }

            }

            alert('Éxito', 'Transacción añadida.');
            
            
        }catch (error) {
            console.error("Error en handleSubmit:", error);
            alert('Error', 'No se pudo guardar la transacción o actualizar el presupuesto.');
        }

    }


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