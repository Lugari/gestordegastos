import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { DEFAULT_CURRENCY } from '../constants/currencies';
import { formatMoney, setActiveCurrency } from '../utils/formatMoney';

const CURRENCY_KEY = '@currency';

const CurrencyContext = createContext({
  currency: DEFAULT_CURRENCY,
  setCurrency: () => {},
  format: (amount) => formatMoney(amount, DEFAULT_CURRENCY),
});

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrencyState] = useState(DEFAULT_CURRENCY);

  useEffect(() => {
    AsyncStorage.getItem(CURRENCY_KEY).then((value) => {
      if (value) setCurrencyState(value);
    });
  }, []);

  // Mantiene la moneda activa global (para helpers fuera de React) en sincronía.
  useEffect(() => {
    setActiveCurrency(currency);
  }, [currency]);

  const setCurrency = useCallback(async (code) => {
    setActiveCurrency(code);
    setCurrencyState(code);
    await AsyncStorage.setItem(CURRENCY_KEY, code);
  }, []);

  // Formateador central usado por toda la app.
  const format = useCallback((amount) => formatMoney(amount, currency), [currency]);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, format }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
