import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from "./screens/HomeScreen";
import TransactionHistoryScreen from "./screens/TransactionHistoryScreen";
import SingleTransactionScreen from "./screens/SingleTransactionScreen";
import AddTransactionScreen from "./screens/AddTransactionScreen";

const queryClient = new QueryClient(); // Inicializar el QueryClient
const Stack = createNativeStackNavigator(); // Crear el stack navigator

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="HomeScreen">
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
        <Stack.Screen name="TransactionHistoryScreen" component={TransactionHistoryScreen} />
        <Stack.Screen name="SingleTransactionScreen" component={SingleTransactionScreen} />
        <Stack.Screen name="AddTransactionScreen" component={AddTransactionScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
