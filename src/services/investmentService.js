import * as Crypto from 'expo-crypto';

import { makeCollection } from './collection';
import * as BucketService from './bucketService';
import * as TransactionService from './transactionService';
import { toBase } from '../utils/formatMoney';

// Inversiones: operaciones sobre el capital y el valor de mercado + historial.
//
// Semántica del bucket (kind 'investment'):
//   used          = CAPITAL invertido (aportes netos: aportes - retiros de capital)
//   current_value = VALOR de mercado actual
//   ganancia = current_value - used  (verde si +, rojo si -)
//   total         = meta opcional · roi = tasa E.A. (renta fija) o esperada (variable)
//   type: 'fixed' (renta fija) | 'variable' | 'crypto' | 'other'
//   fixed: rate (roi), open_date, maturity_date, last_accrual (YYYY-MM-DD)
//
// Movimiento (InvestmentMove):
//   { id, investment_id, kind: 'contribution'|'withdrawal'|'dividend'|'accrual'|'revalue',
//     amount, note, date }
const col = makeCollection('InvestmentMove');

export const FIXED_TYPE = 'fixed';
export const isInvestment = (b) => b?.kind === 'investment';
export const isFixedIncome = (b) => isInvestment(b) && b?.type === FIXED_TYPE;

// Valor actual robusto: si nunca se ha fijado, equivale al capital.
export const currentValue = (inv) =>
  inv?.current_value != null ? Number(inv.current_value) || 0 : Number(inv?.used) || 0;

export const gainOf = (inv) => currentValue(inv) - (Number(inv?.used) || 0);

export const getMovesFor = async (investmentId) => {
  const all = await col.getAll();
  return all
    .filter((m) => m.investment_id === investmentId)
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
};

const addMove = (investment, kind, amountBase, note) =>
  col.add({
    id: Crypto.randomUUID(),
    investment_id: investment.id,
    kind,
    amount: Math.round(amountBase),
    note: note || '',
    date: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

// Aporte: dinero desde una cuenta entra al capital y al valor de mercado.
// No es un gasto (traslado de patrimonio) → flag is_investment_flow.
export const registerContribution = async ({ investment, amount, currency, account, note }) => {
  const base = toBase(parseFloat(amount) || 0, currency);
  if (base <= 0) return;
  await addMove(investment, 'contribution', base, note);
  await BucketService.updateBucketById(investment.id, {
    used: (Number(investment.used) || 0) + base,
    current_value: currentValue(investment) + base,
  });
  await TransactionService.addTransaction({
    type: 'gasto',
    is_investment_flow: true,
    account: account || '',
    amount: base,
    notes: `Aporte a ${investment.name}`,
    date: new Date().toISOString(),
    investment_id: investment.id,
  }).catch(() => {});
};

// Retiro / redención: saca `amount` del valor de mercado a una cuenta.
// Devuelve capital (proporcional, no es ingreso) y REALIZA la ganancia
// proporcional (esa parte sí es ingreso; una pérdida se registra como gasto).
export const registerWithdrawal = async ({ investment, amount, currency, account, note }) => {
  const value = currentValue(investment);
  const capital = Number(investment.used) || 0;
  const base = Math.min(toBase(parseFloat(amount) || 0, currency), value);
  if (base <= 0) return;

  const proportion = value > 0 ? base / value : 0;
  const capitalOut = Math.round(capital * proportion);
  const gainOut = Math.round(base - capitalOut); // + ganancia realizada, - pérdida

  await addMove(investment, 'withdrawal', base, note);
  await BucketService.updateBucketById(investment.id, {
    used: Math.max(0, capital - capitalOut),
    current_value: Math.max(0, value - base),
  });

  // Devolución de capital: no es ingreso (traslado de patrimonio).
  if (capitalOut > 0) {
    await TransactionService.addTransaction({
      type: 'ingreso', is_investment_flow: true, account: account || '',
      amount: capitalOut, notes: `Retiro de ${investment.name}`,
      date: new Date().toISOString(), investment_id: investment.id,
    }).catch(() => {});
  }
  // Ganancia (o pérdida) realizada: SÍ cuenta en las métricas.
  if (gainOut > 0) {
    await TransactionService.addTransaction({
      type: 'ingreso', account: account || '', amount: gainOut,
      notes: `Ganancia realizada · ${investment.name}`,
      date: new Date().toISOString(), investment_id: investment.id,
    }).catch(() => {});
  } else if (gainOut < 0) {
    await TransactionService.addTransaction({
      type: 'gasto', account: account || '', amount: -gainOut,
      notes: `Pérdida realizada · ${investment.name}`,
      date: new Date().toISOString(), investment_id: investment.id,
    }).catch(() => {});
  }
};

// Dividendo / rendimiento pagado. Si va a una cuenta → ingreso real y el valor
// no cambia (te pagaron en efectivo). Si se reinvierte → sube el valor (no
// realizado, sin transacción).
export const registerDividend = async ({ investment, amount, currency, account, reinvest, note }) => {
  const base = toBase(parseFloat(amount) || 0, currency);
  if (base <= 0) return;
  await addMove(investment, 'dividend', base, note || (reinvest ? 'Reinvertido' : 'Dividendo'));
  if (reinvest) {
    await BucketService.updateBucketById(investment.id, { current_value: currentValue(investment) + base });
  } else {
    await TransactionService.addTransaction({
      type: 'ingreso', account: account || '', amount: base,
      notes: `Dividendo · ${investment.name}`,
      date: new Date().toISOString(), investment_id: investment.id,
    }).catch(() => {});
  }
};

// Revaluar: fija el valor de mercado de hoy (renta variable / cripto).
export const revalue = async ({ investment, newValue, currency, note }) => {
  const base = toBase(parseFloat(newValue) || 0, currency);
  await addMove(investment, 'revalue', base, note);
  await BucketService.updateBucketById(investment.id, { current_value: Math.max(0, base) });
};

export const addAccrualMove = (investment, amountBase, note) => addMove(investment, 'accrual', amountBase, note);

export const deleteMovesFor = async (investmentId) => {
  const moves = await getMovesFor(investmentId);
  await Promise.all(moves.map((m) => col.remove(m.id).catch(() => {})));
};

// ---------- causación de renta fija ----------
export const toDayString = (d) => {
  const x = new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
};

const parseDay = (s) => {
  const [y, m, d] = String(s).split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};

// Interés compuesto E.A. entre dos días sobre un valor dado. Idempotente:
// solo causa los días no causados aún (from → to). Se limita al vencimiento.
export const computeAccrual = (inv, fromDay, toDay) => {
  const eaRate = (Number(inv.roi) || 0) / 100;
  if (eaRate <= 0) return { interest: 0, days: 0, throughDay: fromDay };
  let end = toDay;
  if (inv.maturity_date && inv.maturity_date < end) end = inv.maturity_date;
  const days = Math.round((parseDay(end) - parseDay(fromDay)) / 86400000);
  if (days <= 0) return { interest: 0, days: 0, throughDay: fromDay };
  const value = currentValue(inv);
  const factor = Math.pow(1 + eaRate, days / 365);
  return { interest: Math.round(value * (factor - 1)), days, throughDay: end };
};
