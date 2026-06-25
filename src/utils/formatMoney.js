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

// Moneda activa para formatear desde helpers a nivel de módulo (vistas de
// reporte, exportación) que no pueden usar el hook. El CurrencyProvider la
// mantiene sincronizada; la reactividad la da el re-render del componente padre.
let activeCurrency = DEFAULT_CURRENCY;

export const setActiveCurrency = (code) => {
  activeCurrency = code || DEFAULT_CURRENCY;
};

export const getActiveCurrency = () => activeCurrency;

export const money = (amount) => formatMoney(amount, activeCurrency);

