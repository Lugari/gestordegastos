import { QueryClient, useQueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useContext, useEffect, useState } from "react";
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { CurrencyProvider } from './context/CurrencyContext';

import { migrateLegacyData } from './services/migrateBuckets';
import { migrateLocalToCloud } from './services/cloudSync';
import { catchUpRecurring } from './services/recurringEngine';
import { syncBillReminders } from './services/billsReminders';

import MainTabs from "./navigation/MainTabs";
import SingleTransactionScreen from "./screens/SingleTransactionScreen";
import AddTransactionScreen from "./screens/AddTransactionScreen";
import BucketListScreen from "./screens/BucketListScreen";
import AddBucketScreen from "./screens/AddBucketScreen";
import SingleBucketScreen from "./screens/SingleBucketScreen";
import LoginScreen from "./screens/LoginScreen";
import ReportBuilderScreen from "./screens/ReportBuilderScreen";
import AccountsScreen from "./screens/AccountsScreen";
import RecurringScreen from "./screens/RecurringScreen";
import BillsScreen from "./screens/BillsScreen";

import { KIND } from './constants/bucketKinds';

import '../i18n';

// gcTime largo para que la caché sobreviva y sirva de lectura offline al
// persistirla en AsyncStorage.
const queryClient = new QueryClient({
  defaultOptions: { queries: { gcTime: 1000 * 60 * 60 * 24 } }, // 24 h
});

// Persister: guarda la caché de React Query en AsyncStorage (lecturas offline).
const persister = createAsyncStoragePersister({ storage: AsyncStorage });

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { userToken, isLoading } = useContext(AuthContext);
  const queryClient = useQueryClient();

  // Al iniciar sesión: sube los datos locales a la nube (una vez), genera las
  // transacciones recurrentes vencidas y refresca las queries.
  useEffect(() => {
    if (userToken) {
      migrateLocalToCloud()
        .then(() => catchUpRecurring())
        .then(() => syncBillReminders())
        .catch(() => {})
        .finally(() => queryClient.invalidateQueries());
    }
  }, [userToken]);

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
            <Stack.Screen name="RecurringScreen" component={RecurringScreen} options={{ title: "Recurrentes" }} />
            <Stack.Screen name="BillsScreen" component={BillsScreen} options={{ title: "Facturas" }} />
            <Stack.Screen name="SingleTransactionScreen" component={SingleTransactionScreen} options={{ title: "Detalle de transacción" }} />
            <Stack.Screen name="AddTransactionScreen" component={AddTransactionScreen} options={{ title: "Añadir transacción" }} />
            <Stack.Screen name="BudgetsScreen" component={BucketListScreen} initialParams={{ kind: KIND.BUDGET }} options={{ title: "Presupuestos" }} />
            <Stack.Screen name="SingleBudgetScreen" component={SingleBucketScreen} initialParams={{ kind: KIND.BUDGET }} options={{ title: "Detalle de presupuesto" }} />
            <Stack.Screen name="AddBudgetScreen" component={AddBucketScreen} initialParams={{ kind: KIND.BUDGET }} options={{ title: "Añadir presupuesto" }} />
            <Stack.Screen name="SavingsScreen" component={BucketListScreen} initialParams={{ kind: KIND.SAVING }} options={{ title: "Metas de ahorro" }} />
            <Stack.Screen name="SingleSavingScreen" component={SingleBucketScreen} initialParams={{ kind: KIND.SAVING }} options={{ title: "Detalle de ahorro" }} />
            <Stack.Screen name="AddSavingScreen" component={AddBucketScreen} initialParams={{ kind: KIND.SAVING }} options={{ title: "Añadir meta" }} />
            <Stack.Screen name="DebtsScreen" component={BucketListScreen} initialParams={{ kind: KIND.DEBT }} options={{ title: "Deudas" }} />
            <Stack.Screen name="AddDebtScreen" component={AddBucketScreen} initialParams={{ kind: KIND.DEBT }} options={{ title: "Añadir deuda" }} />
            <Stack.Screen name="SingleDebtScreen" component={SingleBucketScreen} initialParams={{ kind: KIND.DEBT }} options={{ title: "Detalle de deuda" }} />
            <Stack.Screen name="InvestmentsScreen" component={BucketListScreen} initialParams={{ kind: KIND.INVESTMENT }} options={{ title: "Inversiones" }} />
            <Stack.Screen name="AddInvestmentScreen" component={AddBucketScreen} initialParams={{ kind: KIND.INVESTMENT }} options={{ title: "Añadir inversión" }} />
            <Stack.Screen name="SingleInvestmentScreen" component={SingleBucketScreen} initialParams={{ kind: KIND.INVESTMENT }} options={{ title: "Detalle de inversión" }} />
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
    <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
      <CurrencyProvider>
        <AuthProvider>
          <AppNavigator />
        </AuthProvider>
      </CurrencyProvider>
    </PersistQueryClientProvider>
  );
}

