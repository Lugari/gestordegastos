import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import HomeScreen from '../screens/HomeScreen';
import TransactionHistoryScreen from '../screens/TransactionHistoryScreen';
import ReportsScreen from '../screens/ReportsScreen';
import MoreScreen from '../screens/MoreScreen';
import { useIsDesktop } from '../hooks/useResponsive';
import { useTheme } from '../context/ThemeContext';

const Tab = createBottomTabNavigator();

// Botón central de añadir (acción más frecuente). En móvil va elevado sobre la
// barra inferior; en el riel de escritorio queda alineado.
const CenterAddButton = () => {
  const navigation = useNavigation();
  const isDesktop = useIsDesktop();
  const { theme } = useTheme();
  return (
    <View style={styles.centerWrap} pointerEvents="box-none">
      <TouchableOpacity
        style={[styles.centerBtn, {
          marginTop: isDesktop ? 4 : -18,
          backgroundColor: theme.green,
          borderColor: theme.background,
        }]}
        accessibilityRole="button"
        accessibilityLabel="Añadir transacción"
        onPress={() => navigation.navigate('AddTransactionScreen')}
      >
        <MaterialIcons name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const MainTabs = () => {
  const isDesktop = useIsDesktop();
  const { theme } = useTheme();

  // Icono con estado activo/inactivo: relleno al enfocarse (con píldora de
  // resalte) y contorno en reposo. MaterialCommunityIcons da pares outline/fill
  // más modernos y consistentes que el set base.
  const navIcon = (filled, outline) => ({ color, focused }) => (
    <View style={[styles.iconPill, focused && { backgroundColor: theme.greenSoft }]}>
      <MaterialCommunityIcons name={focused ? filled : outline} size={23} color={color} />
    </View>
  );

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        // Barra inferior en móvil; riel lateral en escritorio (más natural y deja
        // los destinos visibles sin una barra inferior poco habitual en desktop).
        tabBarPosition: isDesktop ? 'left' : 'bottom',
        tabBarActiveTintColor: theme.green,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: isDesktop
          ? { width: 96, paddingTop: 12, backgroundColor: theme.card, borderColor: theme.border }
          : { height: 66, paddingBottom: 8, paddingTop: 8, backgroundColor: theme.card, borderTopColor: theme.border },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarItemStyle: isDesktop ? { height: 64 } : undefined,
      }}
    >
      <Tab.Screen name="HomeScreen" component={HomeScreen} options={{ title: 'Inicio', tabBarIcon: navIcon('home-variant', 'home-variant-outline') }} />
      <Tab.Screen
        name="TransactionHistoryScreen"
        component={TransactionHistoryScreen}
        options={{ title: 'Historial', tabBarIcon: navIcon('text-box', 'text-box-outline') }}
      />
      <Tab.Screen
        name="AddTab"
        component={View}
        options={{ tabBarButton: () => <CenterAddButton />, tabBarLabel: () => null }}
      />
      <Tab.Screen name="ReportsScreen" component={ReportsScreen} options={{ title: 'Reportes', tabBarIcon: navIcon('chart-box', 'chart-box-outline') }} />
      <Tab.Screen name="MoreScreen" component={MoreScreen} options={{ title: 'Más', tabBarIcon: navIcon('dots-horizontal-circle', 'dots-horizontal-circle-outline') }} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  iconPill: {
    minWidth: 46,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  centerWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});

export default MainTabs;
