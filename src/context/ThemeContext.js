import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Sistema de temas: modo 'auto' (sigue al sistema), 'light' u 'dark',
// persistido por dispositivo. Las pantallas consumen la paleta con useTheme()
// y crean sus estilos dinámicamente (las hojas estáticas no pueden cambiar).
const KEY = '@theme_mode';

export const LIGHT = {
  isDark: false,
  background: '#F5F5EF', // fondo de página (cálido, el de la marca)
  card: '#FFFFFF',
  cardAlt: '#EAEAE0', // tarjetas planas del dashboard
  inputBg: '#FFFFFF',
  textPrimary: '#141414',
  textSecondary: '#4f6057',
  neutral: '#9a9a90',
  border: '#d6d6cc',
  green: '#1C6B52', // acento de marca
  greenSoft: '#E1F5EE', // tinte para chips/resaltados
  danger: '#D76A61',
  income: '#3B6D11',
  expense: '#A32D2D',
  saving: '#0F6E56',
  track: '#ECECE3', // rieles de barras de progreso
  overlay: 'rgba(0,0,0,0.45)',
  // tintes suaves para chips/totales por tipo
  incomeSoft: '#EAF3DE',
  expenseSoft: '#FAECE7',
  savingSoft: '#E1F5EE',
  // variantes intensas para texto sobre los tintes
  incomeStrong: '#27500A',
  expenseStrong: '#712B13',
  savingStrong: '#085041',
};

export const DARK = {
  isDark: true,
  background: '#131513',
  card: '#1E221E',
  cardAlt: '#262B26',
  inputBg: '#262B26',
  textPrimary: '#ECECE4',
  textSecondary: '#A9B4AD',
  neutral: '#7C7C72',
  border: '#3A403A',
  green: '#3AA981', // acento más luminoso para contraste sobre oscuro
  greenSoft: '#17342B',
  danger: '#E08880',
  income: '#8FC155',
  expense: '#E07B6A',
  saving: '#4FC3A1',
  track: '#2E332E',
  overlay: 'rgba(0,0,0,0.6)',
  incomeSoft: '#222E19',
  expenseSoft: '#37211C',
  savingSoft: '#16332B',
  incomeStrong: '#B5DA8B',
  expenseStrong: '#F2A897',
  savingStrong: '#8ADFC4',
};

const ThemeContext = createContext({ theme: LIGHT, mode: 'auto', isDark: false, setMode: () => {} });

export const ThemeProvider = ({ children }) => {
  const system = useColorScheme(); // 'light' | 'dark' | null
  const [mode, setModeState] = useState('auto');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((v) => { if (v === 'light' || v === 'dark' || v === 'auto') setModeState(v); })
      .finally(() => setReady(true));
  }, []);

  const setMode = (m) => {
    setModeState(m);
    AsyncStorage.setItem(KEY, m).catch(() => {});
  };

  const isDark = mode === 'dark' || (mode === 'auto' && system === 'dark');
  const theme = isDark ? DARK : LIGHT;
  const value = useMemo(() => ({ theme, mode, isDark, setMode }), [theme, mode, isDark]);

  if (!ready) return null; // evita el "flash" del tema equivocado al arrancar

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
