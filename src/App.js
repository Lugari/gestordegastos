import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useContext, useEffect, useState } from "react";
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { CurrencyProvider } from './context/CurrencyContext';

import { migrateLegacyData } from './services/migrateBuckets';

import MainTabs from "./navigation/MainTabs";
import SingleTransactionScreen from "./screens/SingleTransactionScreen";
import AddTransactionScreen from "./screens/AddTransactionScreen";
import BucketListScreen from "./screens/BucketListScreen";
import AddBucketScreen from "./screens/AddBucketScreen";
import SingleBucketScreen from "./screens/SingleBucketScreen";
import LoginScreen from "./screens/LoginScreen";
import ReportBuilderScreen from "./screens/ReportBuilderScreen";
import AccountsScreen from "./screens/AccountsScreen";

import { KIND } from './constants/bucketKinds';

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
            <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
            <Stack.Screen name="ReportBuilderScreen" component={ReportBuilderScreen} options={{ title: "Reporte personalizado" }} />
            <Stack.Screen name="AccountsScreen" component={AccountsScreen} options={{ title: "Cuentas" }} />
            <Stack.Screen name="SingleTransactionScreen" component={SingleTransactionScreen} options={{ title: "Detalles de Transacción" }} />
            <Stack.Screen name="AddTransactionScreen" component={AddTransactionScreen} options={{ title: "Añadir Transacción" }} />
            <Stack.Screen name="BudgetsScreen" component={BucketListScreen} initialParams={{ kind: KIND.BUDGET }} options={{ title: "Presupuesto" }} />
            <Stack.Screen name="SingleBudgetScreen" component={SingleBucketScreen} initialParams={{ kind: KIND.BUDGET }} options={{ title: "Detalles de Presupuesto" }} />
            <Stack.Screen name="AddBudgetScreen" component={AddBucketScreen} initialParams={{ kind: KIND.BUDGET }} options={{ title: "Añadir Presupuesto" }} />
            <Stack.Screen name="SavingsScreen" component={BucketListScreen} initialParams={{ kind: KIND.SAVING }} options={{ title: "Metas de Ahorro" }} />
            <Stack.Screen name="SingleSavingScreen" component={SingleBucketScreen} initialParams={{ kind: KIND.SAVING }} options={{ title: "Detalles de Ahorro" }} />
            <Stack.Screen name="AddSavingScreen" component={AddBucketScreen} initialParams={{ kind: KIND.SAVING }} options={{ title: "Añadir Meta" }} />
            <Stack.Screen name="DebtsScreen" component={BucketListScreen} initialParams={{ kind: KIND.DEBT }} options={{ title: "Deudas" }} />
            <Stack.Screen name="AddDebtScreen" component={AddBucketScreen} initialParams={{ kind: KIND.DEBT }} options={{ title: "Añadir Deuda" }} />
            <Stack.Screen name="SingleDebtScreen" component={SingleBucketScreen} initialParams={{ kind: KIND.DEBT }} options={{ title: "Detalles de Deuda" }} />
            <Stack.Screen name="InvestmentsScreen" component={BucketListScreen} initialParams={{ kind: KIND.INVESTMENT }} options={{ title: "Inversiones" }} />
            <Stack.Screen name="AddInvestmentScreen" component={AddBucketScreen} initialParams={{ kind: KIND.INVESTMENT }} options={{ title: "Añadir Inversión" }} />
            <Stack.Screen name="SingleInvestmentScreen" component={SingleBucketScreen} initialParams={{ kind: KIND.INVESTMENT }} options={{ title: "Detalles de Inversión" }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  // Ejecuta la migración al modelo unificado una sola vez, antes de montar la app,
  // para que los hooks (que en fases siguientes leerán de @buckets) tengan los datos listos.
  const [migrationReady, setMigrationReady] = useState(false);

  useEffect(() => {
    migrateLegacyData().finally(() => setMigrationReady(true));
  }, []);

  if (!migrationReady) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <CurrencyProvider>
        <AuthProvider>
          <AppNavigator />
        </AuthProvider>
      </CurrencyProvider>
    </QueryClientProvider>
  );
}

