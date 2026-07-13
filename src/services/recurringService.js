import * as Crypto from 'expo-crypto';

import { makeCollection } from './collection';

// Reglas de transacciones recurrentes, sincronizadas en la nube por usuario.
//
// Modelo de regla:
// {
//   id, active: bool,
//   template: { type, amount, currency, notes, account, budget_id, category_id, ... },
//   freq: 'days' | 'monthly',
//   interval: N   (freq 'days'  → cada N días: 1=diario, 7=semanal, 15=quincenal, X=personalizado)
//   day: D        (freq 'monthly' → el día D de cada mes, 1..31; se ajusta a meses cortos)
//   next_run: 'YYYY-MM-DD'  (próxima fecha a generar)
//   created_at, updated_at
// }
const col = makeCollection('RecurringRule');

// --- utilidades de fecha (solo día, sin horas) ---
export const toDayString = (d) => {
  const x = d instanceof Date ? d : new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
};

const fromDayString = (s) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0); // mediodía local: evita líos de zona horaria
};

// Días que tiene un mes dado (mes 1..12).
const daysInMonth = (year, month) => new Date(year, month, 0).getDate();

// Próxima ocurrencia estrictamente posterior a `afterDay` (string YYYY-MM-DD).
export const advanceNextRun = (rule, afterDay) => {
  const after = fromDayString(afterDay);
  if (rule.freq === 'days') {
    const next = new Date(after);
    next.setDate(next.getDate() + Math.max(1, Number(rule.interval) || 1));
    return toDayString(next);
  }
  // monthly: el día `rule.day` del mes siguiente a `after` (o de este mes si aún no pasa).
  const D = Math.min(31, Math.max(1, Number(rule.day) || 1));
  let y = after.getFullYear();
  let m = after.getMonth() + 1; // 1..12
  // candidato en el mes actual
  let day = Math.min(D, daysInMonth(y, m));
  if (day <= after.getDate()) {
    m += 1;
    if (m > 12) { m = 1; y += 1; }
    day = Math.min(D, daysInMonth(y, m));
  }
  return `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

// Fecha (Date) de una ocurrencia concreta, para fechar la transacción generada.
export const occurrenceDate = (dayString) => fromDayString(dayString);

// Primera ocurrencia EN o DESPUÉS de `fromDay`:
//  - freq 'days': el propio fromDay (la fecha de inicio ES la primera ocurrencia).
//  - freq 'monthly': el primer "día D" que caiga en fromDay o después.
export const firstRunOnOrAfter = (rule, fromDay) => {
  if (rule.freq === 'days') return fromDay;
  const A = fromDayString(fromDay);
  const D = Math.min(31, Math.max(1, Number(rule.day) || 1));
  const y = A.getFullYear();
  const m = A.getMonth() + 1;
  const dayThisMonth = Math.min(D, daysInMonth(y, m));
  if (dayThisMonth >= A.getDate()) {
    return `${y}-${String(m).padStart(2, '0')}-${String(dayThisMonth).padStart(2, '0')}`;
  }
  return advanceNextRun(rule, fromDay);
};

// --- CRUD ---
export const getAllRules = () => col.getAll();

// `startDay` (YYYY-MM-DD) es la fecha de la transacción: marca el INICIO de la
// recurrencia. Si es futura, la primera ocurrencia la genera el motor ese día
// (`firstOccurrencePending`); si es hoy o pasada, el formulario ya creó esa
// transacción y la regla continúa a partir de ahí.
export const addRule = ({ template, freq, interval, day, startDay, firstOccurrencePending = false }) => {
  const now = new Date().toISOString();
  const start = startDay || toDayString(new Date());
  const rule = {
    id: Crypto.randomUUID(),
    active: true,
    template,
    freq,
    interval: freq === 'days' ? Math.max(1, Number(interval) || 1) : undefined,
    day: freq === 'monthly' ? Math.min(31, Math.max(1, Number(day) || 1)) : undefined,
    start_day: start,
    next_run: null,
    created_at: now,
    updated_at: now,
  };
  rule.next_run = firstOccurrencePending
    ? firstRunOnOrAfter(rule, start) // el motor la creará al llegar la fecha
    : advanceNextRun(rule, start); // la del inicio ya existe; sigue la próxima
  return col.add(rule);
};

export const updateRule = (id, updates) =>
  col.update(id, { ...updates, updated_at: new Date().toISOString() });

export const deleteRule = (id) => col.remove(id);

// Etiqueta legible de la frecuencia, para las listas.
export const freqLabel = (rule) => {
  if (rule.freq === 'monthly') return `Cada ${rule.day} del mes`;
  const n = Number(rule.interval) || 1;
  if (n === 1) return 'Diario';
  if (n === 7) return 'Semanal';
  if (n === 15) return 'Quincenal';
  return `Cada ${n} días`;
};
