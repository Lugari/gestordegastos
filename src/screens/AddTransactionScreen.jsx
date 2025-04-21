import AddTransactionForm from "../components/transactions/AddTransactionForm";  

import { StyleSheet, ScrollView } from "react-native";


const AddTransactionScreen = () => {
    return (
        <ScrollView contentContainerStyle={styles.container}>
        <AddTransactionForm />
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