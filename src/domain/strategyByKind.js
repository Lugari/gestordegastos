// Estrategia por tipo de bucket: encapsula las diferencias semánticas
// (cómo se mueve el saldo, cómo aporta al patrimonio, qué pide el formulario)
// para que el resto del código sea agnóstico al `kind`.
//
// Nota: en Fase 0 este registro solo se define; se cablea en fases posteriores
// (saldo en Fase 3, formularios/UI genérica en Fase 5).

import { KIND } from '../constants/bucketKinds';

// Aplica una transacción al saldo "usado" del bucket.
// `signedAmount` es positivo al añadir una transacción y negativo al revertirla.
const applyDelta = (bucket, signedAmount) => ({
  used: Math.max(0, (Number(bucket.used) || 0) + (Number(signedAmount) || 0)),
});

export const strategyByKind = {
  [KIND.BUDGET]: {
    label: 'Presupuesto',
    plural: 'Presupuestos',
    netWorth: 'neutral', // un presupuesto es un límite de gasto, no patrimonio
    icon: 'account-balance-wallet',
    formFields: ['name', 'total', 'period', 'color', 'icon', 'notes'],
    applyTransaction: applyDelta, // gastar suma a "usado"
  },

  [KIND.SAVING]: {
    label: 'Ahorro',
    plural: 'Ahorros',
    netWorth: 'asset',
    icon: 'savings',
    formFields: ['name', 'total', 'color', 'icon'],
    applyTransaction: applyDelta, // aportar suma a lo acumulado
  },

  [KIND.DEBT]: {
    label: 'Deuda',
    plural: 'Deudas',
    netWorth: 'liability',
    icon: 'credit-card',
    formFields: ['name', 'total', 'apr', 'fees'],
    applyTransaction: applyDelta, // pagar suma a lo abonado
  },

  [KIND.INVESTMENT]: {
    label: 'Inversión',
    plural: 'Inversiones',
    netWorth: 'asset',
    icon: 'trending-up',
    formFields: ['name', 'total', 'roi', 'color', 'icon'],
    applyTransaction: applyDelta, // aportar suma al valor invertido
  },
};

export const getStrategy = (kind) => strategyByKind[kind] ?? null;

// Helpers de patrimonio (útiles para Home/Reportes en fases siguientes).
export const isAsset = (kind) => getStrategy(kind)?.netWorth === 'asset';
export const isLiability = (kind) => getStrategy(kind)?.netWorth === 'liability';
