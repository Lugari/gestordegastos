import * as Crypto from 'expo-crypto';

import { makeCloudCollection } from './cloudCollection';
import * as BucketService from './bucketService';
import { toBase } from '../utils/formatMoney';

// Tarjetas de crédito: planes de cuotas y operaciones sobre la deuda.
//
// Semántica de la tarjeta (bucket kind 'debt', type 'credit card'):
//   total = CUPO de la tarjeta · used = DEUDA actual (cupo disponible = total - used)
//
// Plan de cuotas (CardPurchase):
// {
//   id, card_id, kind: 'purchase' | 'advance',
//   amount            (capital original, en moneda base)
//   installments      (número de cuotas; avances SIEMPRE 24)
//   installment_amount (amount / installments)
//   remaining         (capital pendiente)
//   interest: bool    (compras: según la tarjeta y >1 cuota; avances: siempre)
//   date, notes, closed: bool
// }
const col = makeCloudCollection('CardPurchase');

export const ADVANCE_INSTALLMENTS = 24;

export const isCreditCard = (bucket) => bucket?.kind === 'debt' && bucket?.type === 'credit card';

export const getPlansForCard = async (cardId) => {
  const all = await col.getAll();
  return all
    .filter((p) => p.card_id === cardId)
    .sort((a, b) => (a.date || '').localeCompare(b.date || ''));
};

export const getAllPlans = () => col.getAll();

const newPlan = ({ card, kind, amountBase, installments, interest, notes }) => {
  const now = new Date().toISOString();
  return {
    id: Crypto.randomUUID(),
    card_id: card.id,
    kind,
    amount: amountBase,
    installments,
    installment_amount: amountBase / installments,
    remaining: amountBase,
    interest,
    notes: notes || '',
    date: now,
    closed: false,
    created_at: now,
    updated_at: now,
  };
};

// Compra con tarjeta: crea el plan y sube la deuda.
export const registerPurchase = async ({ card, amount, currency, installments, notes }) => {
  const amountBase = toBase(parseFloat(amount) || 0, currency);
  const n = Math.max(1, Number(installments) || 1);
  const interest = !!card.interest_enabled && n > 1; // 1 cuota = sin interés
  await col.add(newPlan({ card, kind: 'purchase', amountBase, installments: n, interest, notes }));
  await BucketService.updateBucketById(card.id, { used: (Number(card.used) || 0) + amountBase });
};

// Avance en efectivo: SIEMPRE diferido a 24 cuotas y con interés desde el día 1.
export const registerAdvance = async ({ card, amount, currency, notes }) => {
  const amountBase = toBase(parseFloat(amount) || 0, currency);
  await col.add(newPlan({
    card, kind: 'advance', amountBase,
    installments: ADVANCE_INSTALLMENTS, interest: true,
    notes: notes || 'Avance en efectivo',
  }));
  await BucketService.updateBucketById(card.id, { used: (Number(card.used) || 0) + amountBase });
};

// Abono a la tarjeta (pago de factura o abono extra): baja la deuda y libera
// cupo. Los planes de cuotas NO se tocan aquí: son el calendario de cobro y
// solo el corte descuenta sus cuotas (evita el doble descuento de capital).
export const applyPaymentToCard = async (card, amountBase) => {
  const pay = Math.max(0, Number(amountBase) || 0);
  if (!pay) return;
  const newUsed = Math.max(0, (Number(card.used) || 0) - pay);
  await BucketService.updateBucketById(card.id, { used: newUsed });
};

export const updatePlan = (id, updates) => col.update(id, updates);
export const deletePlansForCard = async (cardId) => {
  const plans = await getPlansForCard(cardId);
  await Promise.all(plans.map((p) => col.remove(p.id).catch(() => {})));
};

// ---------- matemática del corte ----------
const daysInMonth = (y, m) => new Date(y, m, 0).getDate(); // m 1..12
const dayStr = (y, m, d) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

// Fecha de corte de un mes dado ('YYYY-MM'), con ajuste de mes corto.
export const cutDateFor = (card, monthKey) => {
  const [y, m] = monthKey.split('-').map(Number);
  const d = Math.min(Math.max(1, Number(card.cut_day) || 1), daysInMonth(y, m));
  return dayStr(y, m, d);
};

// Fecha límite: el primer "día D límite" estrictamente después del corte.
export const dueDateAfterCut = (card, cutDay) => {
  const [y, m, d] = cutDay.split('-').map(Number);
  const D = Math.min(31, Math.max(1, Number(card.due_day) || 1));
  let yy = y, mm = m;
  let day = Math.min(D, daysInMonth(yy, mm));
  if (day <= d) {
    mm += 1;
    if (mm > 12) { mm = 1; yy += 1; }
    day = Math.min(D, daysInMonth(yy, mm));
  }
  return dayStr(yy, mm, day);
};

// Extracto del corte: cuánto capital vence, cuánto interés se causa y el total.
// Muta los planes (descuenta la cuota del capital) SOLO si `apply` es true.
export const computeStatement = (card, plans) => {
  const rate = (Number(card.interest_rate) || 0) / 100; // % mensual sobre saldo
  let capital = 0;
  let interest = 0;
  const planUpdates = [];

  for (const p of plans) {
    if (p.closed) continue;
    const remaining = Number(p.remaining) || 0;
    if (remaining <= 0) continue;
    const capDue = Math.min(Number(p.installment_amount) || 0, remaining);
    const intDue = p.interest ? remaining * rate : 0;
    capital += capDue;
    interest += intDue;
    const newRemaining = remaining - capDue;
    planUpdates.push({ id: p.id, remaining: newRemaining, closed: newRemaining <= 0.005 });
  }

  const fee = plans.some((p) => !p.closed && (Number(p.remaining) || 0) > 0) || (Number(card.used) || 0) > 0
    ? Number(card.handling_fee) || 0
    : 0;

  return {
    capital: Math.round(capital),
    interest: Math.round(interest),
    fee: Math.round(fee),
    total: Math.round(capital + interest + fee),
    planUpdates,
  };
};
