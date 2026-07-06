import * as Crypto from 'expo-crypto';

import { makeCloudCollection } from './cloudCollection';
import { toDayString } from './recurringService';

// Facturas / recordatorios de pago, sincronizadas en la nube por usuario.
//
// Modelo:
// {
//   id, name, amount, currency, active: bool,
//   kind: 'monthly' | 'once',
//   day: D            (monthly → vence el día D de cada mes; se ajusta a meses cortos)
//   date: 'YYYY-MM-DD' (once → fecha única de vencimiento)
//   remind_days_before: N (aviso N días antes; 0 = el mismo día)
//   paid: { 'YYYY-MM-DD': true }  (pagos por ocurrencia)
//   created_at, updated_at
// }
const col = makeCloudCollection('Bill');

const daysInMonth = (year, month) => new Date(year, month, 0).getDate(); // month 1..12

// Fecha de vencimiento de la factura en un mes dado (year, month 1..12) o null.
export const occurrenceInMonth = (bill, year, month) => {
  if (bill.kind === 'once') {
    const [y, m] = (bill.date || '').split('-').map(Number);
    return y === year && m === month ? bill.date : null;
  }
  const D = Math.min(31, Math.max(1, Number(bill.day) || 1));
  const day = Math.min(D, daysInMonth(year, month));
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

// Próximo vencimiento NO pagado en o después de `fromDay` (o null si no hay).
export const nextUnpaidOccurrence = (bill, fromDay = toDayString(new Date())) => {
  if (!bill.active) return null;
  if (bill.kind === 'once') {
    return bill.date && bill.date >= fromDay && !isPaid(bill, bill.date) ? bill.date : null;
  }
  const [y, m] = fromDay.split('-').map(Number);
  // busca en los próximos 13 meses (cubre saltos de "pagada por adelantado")
  for (let i = 0; i < 13; i++) {
    const yy = y + Math.floor((m - 1 + i) / 12);
    const mm = ((m - 1 + i) % 12) + 1;
    const occ = occurrenceInMonth(bill, yy, mm);
    if (occ && occ >= fromDay && !isPaid(bill, occ)) return occ;
  }
  return null;
};

export const isPaid = (bill, occurrenceDay) => !!bill.paid?.[occurrenceDay];

// --- CRUD ---
export const getAllBills = () => col.getAll();

export const addBill = ({ name, amount, currency, kind, day, date, remindDaysBefore }) => {
  const now = new Date().toISOString();
  return col.add({
    id: Crypto.randomUUID(),
    name: (name || '').trim(),
    amount: parseFloat(amount) || 0,
    currency,
    active: true,
    kind,
    day: kind === 'monthly' ? Math.min(31, Math.max(1, Number(day) || 1)) : undefined,
    date: kind === 'once' ? date : undefined,
    remind_days_before: Math.max(0, Number(remindDaysBefore) ?? 1),
    paid: {},
    created_at: now,
    updated_at: now,
  });
};

export const updateBill = (id, updates) =>
  col.update(id, { ...updates, updated_at: new Date().toISOString() });

export const deleteBill = (id) => col.remove(id);

// Marca/desmarca una ocurrencia como pagada.
export const setPaid = async (bill, occurrenceDay, value) => {
  const paid = { ...(bill.paid || {}) };
  if (value) paid[occurrenceDay] = true;
  else delete paid[occurrenceDay];
  return updateBill(bill.id, { paid });
};

// Etiqueta del vencimiento, para listas.
export const dueLabel = (bill) => {
  if (bill.kind === 'once') return `Vence el ${bill.date}`;
  return `Vence el ${bill.day} de cada mes`;
};
