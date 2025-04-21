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
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
        <Stack.Screen name="TransactionHistoryScreen" component={TransactionHistoryScreen} />
        <Stack.Screen name="SingleTransactionScreen" component={SingleTransactionScreen} />
        <Stack.Screen name="AddTransactionScreen" component={AddTransactionScreen} />
        <Stack.Screen name="BudgetsScreen" component={BudgetScreen} />
        <Stack.Screen name="SingleBudgetScreen" component={SingleBudgetScreen} />
        <Stack.Screen name="AddBudgetScreen" component={AddBudgetScreen} />
        <Stack.Screen name="SavingsScreen" component={SavingsScreen} />
        <Stack.Screen name="SingleSavingScreen" component={SingleSavingScreen} />
        <Stack.Screen name="AddSavingScreen" component={AddSavingScreen} />
      </Stack.Navigator>
    </NavigationContainer>
    </QueryClientProvider>
  );
}
