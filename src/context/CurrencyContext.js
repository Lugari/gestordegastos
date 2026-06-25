import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { DEFAULT_CURRENCY } from '../constants/currencies';
import { formatMoney, convertAmount, setActiveCurrency, setActiveBase, setActiveRates } from '../utils/formatMoney';
import { loadInitialRates, fetchRates } from '../services/exchangeRateService';

const CURRENCY_KEY = '@currency';
const BASE_KEY = '@base_currency';

const CurrencyContext = createContext({
  currency: DEFAULT_CURRENCY,
  baseCurrency: DEFAULT_CURRENCY,
  setCurrency: () => {},
  setBaseCurrency: () => {},
  format: (amount) => formatMoney(amount, DEFAULT_CURRENCY),
  formatIn: (amount, code) => formatMoney(amount, code),
  convert: (amount) => amount,
  rates: null,
  ratesUpdatedAt: null,
  refreshRates: async () => {},
  loadingRates: false,
});

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrencyState] = useState(DEFAULT_CURRENCY); // moneda de visualización
  const [baseCurrency, setBaseState] = useState(DEFAULT_CURRENCY); // moneda en que se guardan los datos
  const [rates, setRates] = useState(null);
  const [ratesUpdatedAt, setRatesUpdatedAt] = useState(null);
  const [loadingRates, setLoadingRates] = useState(false);

  // Carga inicial de preferencias y tasas (caché o respaldo); luego intenta
  // refrescar por red sin bloquear.
  useEffect(() => {
    (async () => {
      const [savedCurrency, savedBase, initialRates] = await Promise.all([
        AsyncStorage.getItem(CURRENCY_KEY),
        AsyncStorage.getItem(BASE_KEY),
        loadInitialRates(),
      ]);
      if (savedCurrency) setCurrencyState(savedCurrency);
      if (savedBase) setBaseState(savedBase);
      setRates(initialRates.rates);
      setRatesUpdatedAt(initialRates.updatedAt);

      // Refresco en segundo plano (silencioso si falla / sin red).
      try {
        const fresh = await fetchRates();
        setRates(fresh.rates);
        setRatesUpdatedAt(fresh.updatedAt);
      } catch (e) {
        // se conservan las tasas en caché/respaldo
      }
    })();
  }, []);

  // Mantiene en sincronía la configuración global (helpers fuera de React).
  useEffect(() => setActiveCurrency(currency), [currency]);
  useEffect(() => setActiveBase(baseCurrency), [baseCurrency]);
  useEffect(() => setActiveRates(rates), [rates]);

  const setCurrency = useCallback(async (code) => {
    setActiveCurrency(code);
    setCurrencyState(code);
    await AsyncStorage.setItem(CURRENCY_KEY, code);
  }, []);

  const setBaseCurrency = useCallback(async (code) => {
    setActiveBase(code);
    setBaseState(code);
    await AsyncStorage.setItem(BASE_KEY, code);
  }, []);

  const refreshRates = useCallback(async () => {
    setLoadingRates(true);
    try {
      const fresh = await fetchRates();
      setRates(fresh.rates);
      setRatesUpdatedAt(fresh.updatedAt);
    } finally {
      setLoadingRates(false);
    }
  }, []);

  // Formatea convirtiendo de la moneda base a la de visualización.
  const format = useCallback(
    (amount) => formatMoney(convertAmount(amount, baseCurrency, currency, rates), currency),
    [baseCurrency, currency, rates],
  );

  const convert = useCallback(
    (amount, from = baseCurrency, to = currency) => convertAmount(amount, from, to, rates),
    [baseCurrency, currency, rates],
  );

  // Formatea un monto en una moneda específica, sin conversión (p. ej. para
  // mostrar una transacción en su moneda original).
  const formatIn = useCallback((amount, code) => formatMoney(amount, code || baseCurrency), [baseCurrency]);

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        baseCurrency,
        setCurrency,
        setBaseCurrency,
        format,
        formatIn,
        convert,
        rates,
        ratesUpdatedAt,
        refreshRates,
        loadingRates,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
