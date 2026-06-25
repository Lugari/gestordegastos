import { getCurrency, DEFAULT_CURRENCY } from '../constants/currencies';

// Formatea un monto en la moneda dada, anteponiendo el símbolo y respetando
// la agrupación de miles y los decimales del locale. El signo negativo va al
// frente (p. ej. -$1.000), igual que en el resto de la app.
export const formatMoney = (amount, code) => {
  const c = getCurrency(code);
  const n = Number(amount) || 0;
  const abs = Math.abs(n).toLocaleString(c.locale, {
    maximumFractionDigits: c.decimals,
    minimumFractionDigits: 0,
  });
  return `${n < 0 ? '-' : ''}${c.symbol}${abs}`;
};

// Convierte un monto entre monedas usando tasas relativas a un pivote (USD).
// monto_to = monto_from * rate[to] / rate[from]
export const convertAmount = (amount, from, to, rates) => {
  const n = Number(amount) || 0;
  if (!rates || from === to || !rates[from] || !rates[to]) return n;
  return n * (rates[to] / rates[from]);
};

// Configuración activa para formatear desde helpers a nivel de módulo (vistas de
// reporte, exportación) que no pueden usar el hook. El CurrencyProvider la
// mantiene sincronizada; la reactividad la da el re-render del componente padre.
let activeDisplay = DEFAULT_CURRENCY;
let activeBase = DEFAULT_CURRENCY;
let activeRates = null;

export const setActiveCurrency = (code) => {
  activeDisplay = code || DEFAULT_CURRENCY;
};
export const setActiveBase = (code) => {
  activeBase = code || DEFAULT_CURRENCY;
};
export const setActiveRates = (rates) => {
  activeRates = rates || null;
};

export const getActiveCurrency = () => activeDisplay;

// Convierte de la moneda base a la de visualización y formatea.
export const money = (amount) =>
  formatMoney(convertAmount(amount, activeBase, activeDisplay, activeRates), activeDisplay);

// Convierte un monto desde su moneda de origen a la moneda base (para agregar).
export const toBase = (amount, from) => convertAmount(amount, from || activeBase, activeBase, activeRates);

