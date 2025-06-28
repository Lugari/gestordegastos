import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";


import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';



import HomeScreen from "./screens/HomeScreen";
import TransactionHistoryScreen from "./screens/TransactionHistoryScreen";
import SingleTransactionScreen from "./screens/SingleTransactionScreen";
import AddTransactionScreen from "./screens/AddTransactionScreen";
import BudgetScreen from "./screens/BudgetsScreen";
import SingleBudgetScreen from "./screens/SingleBudgetScreen";
import AddBudgetScreen from "./screens/AddBudgetScreen";
import SavingsScreen from "./screens/SavingsScreen";
import SingleSavingScreen from "./screens/SingleSavingScreen";
import AddSavingScreen from "./screens/AddSavingScreen";

import '../i18n'; 

const queryClient = new QueryClient(); // Inicializar el QueryClient
const Stack = createNativeStackNavigator(); // Crear el stack navigator

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
    <NavigationContainer>
      <Stack.Navigator initialRouteName="HomeScreen">
        <Stack.Screen name="HomeScreen" component={HomeScreen} options={{headerShown:false}}/>
        <Stack.Screen name="TransactionHistoryScreen" component={TransactionHistoryScreen} options={{title:"Transacciones"}} />
        <Stack.Screen name="SingleTransactionScreen" component={SingleTransactionScreen} options={{title:"Detalles de Transacción"}} />
        <Stack.Screen name="AddTransactionScreen" component={AddTransactionScreen} options={{title:"Añadir Transacción"}} />
        <Stack.Screen name="BudgetsScreen" component={BudgetScreen} options={{title:"Presupuesto"}} />
        <Stack.Screen name="SingleBudgetScreen" component={SingleBudgetScreen} options={{title:"Detalles de Presupuesto"}} />
        <Stack.Screen name="AddBudgetScreen" component={AddBudgetScreen} options={{title:"Añadir Presupuesto"}} />
        <Stack.Screen name="SavingsScreen" component={SavingsScreen} options={{title:"Metas de Ahorro"}} />
        <Stack.Screen name="SingleSavingScreen" component={SingleSavingScreen} options={{title:"Detalles de Ahorro"}}/>
        <Stack.Screen name="AddSavingScreen" component={AddSavingScreen} options={{title:"Añadir Meta"}}/>
      </Stack.Navigator>
    </NavigationContainer>
    </QueryClientProvider>
  );
}
