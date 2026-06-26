import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import HomeScreen from '../screens/HomeScreen';
import TransactionHistoryScreen from '../screens/TransactionHistoryScreen';
import ReportsScreen from '../screens/ReportsScreen';
import MoreScreen from '../screens/MoreScreen';
import { COLORS, SIZES } from '../constants/theme';

const Tab = createBottomTabNavigator();

// Botón central elevado: abre Añadir Transacción (acción más frecuente).
const CenterAddButton = () => {
  const navigation = useNavigation();
  return (
    <View style={styles.centerWrap} pointerEvents="box-none">
      <TouchableOpacity
        style={styles.centerBtn}
        accessibilityLabel="Añadir transacción"
        onPress={() => navigation.navigate('AddTransactionScreen')}
      >
        <MaterialIcons name="add" size={30} color={COLORS.textPrimary} />
      </TouchableOpacity>
    </View>
  );
};

const icon = (name) => ({ color, size }) => <MaterialIcons name={name} size={size} color={color} />;

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: COLORS.success,
      tabBarInactiveTintColor: COLORS.textSecondary,
      tabBarStyle: { height: 60, paddingBottom: 6, paddingTop: 6 },
      tabBarLabelStyle: { fontSize: 11 },
    }}
  >
    <Tab.Screen name="HomeScreen" component={HomeScreen} options={{ title: 'Inicio', tabBarIcon: icon('home') }} />
    <Tab.Screen
      name="TransactionHistoryScreen"
      component={TransactionHistoryScreen}
      options={{ title: 'Historial', tabBarIcon: icon('receipt-long') }}
    />
    <Tab.Screen
      name="AddTab"
      component={View}
      options={{ tabBarButton: () => <CenterAddButton />, tabBarLabel: () => null }}
    />
    <Tab.Screen name="ReportsScreen" component={ReportsScreen} options={{ title: 'Reportes', tabBarIcon: icon('bar-chart') }} />
    <Tab.Screen name="MoreScreen" component={MoreScreen} options={{ title: 'Más', tabBarIcon: icon('more-horiz') }} />
  </Tab.Navigator>
);

const styles = StyleSheet.create({
  centerWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginTop: -18,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.background,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});

export default MainTabs;
