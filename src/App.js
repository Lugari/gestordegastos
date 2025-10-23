import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useContext } from "react";
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, AuthContext } from './context/AuthContext';

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
import LoginScreen from "./screens/LoginScreen";
import ReportsScreen from "./screens/ReportsScreen";
import DebtsScreen from "./screens/DebtsScreen";
import AddDebtScreen from "./screens/AddDebtScreen";
import SingleDebtScreen from "./screens/SingleDebtScreen";

import '../i18n';

const queryClient = new QueryClient();
const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { userToken, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {userToken == null ? (
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        ) : (
          <>
            <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ headerShown: false }} />
            <Stack.Screen name="ReportsScreen" component={ReportsScreen} options={{ title: "Reportes" }} />
            <Stack.Screen name="TransactionHistoryScreen" component={TransactionHistoryScreen} options={{ title: "Transacciones" }} />
            <Stack.Screen name="SingleTransactionScreen" component={SingleTransactionScreen} options={{ title: "Detalles de Transacción" }} />
            <Stack.Screen name="AddTransactionScreen" component={AddTransactionScreen} options={{ title: "Añadir Transacción" }} />
            <Stack.Screen name="BudgetsScreen" component={BudgetScreen} options={{ title: "Presupuesto" }} />
            <Stack.Screen name="SingleBudgetScreen" component={SingleBudgetScreen} options={{ title: "Detalles de Presupuesto" }} />
            <Stack.Screen name="AddBudgetScreen" component={AddBudgetScreen} options={{ title: "Añadir Presupuesto" }} />
            <Stack.Screen name="SavingsScreen" component={SavingsScreen} options={{ title: "Metas de Ahorro" }} />
            <Stack.Screen name="SingleSavingScreen" component={SingleSavingScreen} options={{ title: "Detalles de Ahorro" }} />
            <Stack.Screen name="AddSavingScreen" component={AddSavingScreen} options={{ title: "Añadir Meta" }} />
            <Stack.Screen name="DebtsScreen" component={DebtsScreen} options={{ title: "Deudas" }} />
            <Stack.Screen name="AddDebtScreen" component={AddDebtScreen} options={{ title: "Añadir Deuda" }} />
            <Stack.Screen name="SingleDebtScreen" component={SingleDebtScreen} options={{ title: "Detalles de Deuda" }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </QueryClientProvider>
  );
}

