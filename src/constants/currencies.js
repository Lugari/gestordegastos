// Monedas soportadas. `decimals` define los decimales mostrados;
// `locale` el formato de agrupación de miles.
export const CURRENCIES = [
  { code: 'COP', symbol: '$', name: 'Peso colombiano', locale: 'es-CO', decimals: 0 },
  { code: 'USD', symbol: '$', name: 'Dólar estadounidense', locale: 'en-US', decimals: 2 },
  { code: 'EUR', symbol: '€', name: 'Euro', locale: 'es-ES', decimals: 2 },
  { code: 'MXN', symbol: '$', name: 'Peso mexicano', locale: 'es-MX', decimals: 2 },
  { code: 'ARS', symbol: '$', name: 'Peso argentino', locale: 'es-AR', decimals: 2 },
  { code: 'GBP', symbol: '£', name: 'Libra esterlina', locale: 'en-GB', decimals: 2 },
];

export const DEFAULT_CURRENCY = 'COP';

export const getCurrency = (code) => CURRENCIES.find((c) => c.code === code) || CURRENCIES[0];
