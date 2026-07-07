import * as BucketService from './bucketService';
import * as TransactionService from './transactionService';
import * as Bills from './billsService';
import * as Cards from './cardService';
import { toDayString } from './recurringService';

// Motor de cortes de tarjeta: al abrir la app procesa los cortes vencidos de
// cada tarjeta de crédito ("ponerse al día"), en orden cronológico:
//   1. Calcula el extracto (capital + intereses + cuota de manejo).
//   2. Registra intereses + manejo como gasto (id determinístico ccint-*) y
//      los suma a la deuda.
//   3. Genera la factura del pago (id determinístico ccbill-*) con vencimiento
//      en la fecha límite — entra al calendario/recordatorios de Facturas.
//   4. Descuenta la cuota de capital de cada plan.
//
// Idempotencia multi-dispositivo: los ids determinísticos hacen que la nube
// rechace duplicados; `last_cut` en la tarjeta evita reprocesar meses.
const MAX_MONTHS_CATCHUP = 24;

const monthKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

const nextMonthKey = (key) => {
  let [y, m] = key.split('-').map(Number);
  m += 1;
  if (m > 12) { m = 1; y += 1; }
  return `${y}-${String(m).padStart(2, '0')}`;
};

export const catchUpCardCuts = async () => {
  const today = toDayString(new Date());
  const debts = await BucketService.getBucketsByKind('debt');
  const cards = debts.filter((b) => Cards.isCreditCard(b) && Number(b.cut_day) >= 1);
  if (cards.length === 0) return 0;

  const allPlans = await Cards.getAllPlans();
  let statements = 0;

  for (const card of cards) {
    // Primer mes a procesar: el siguiente al último corte, o el mes de creación.
    let mk = card.last_cut
      ? nextMonthKey(card.last_cut)
      : monthKey(new Date(card.created_at || Date.now()));

    let used = Number(card.used) || 0;
    let lastCut = card.last_cut || null;
    const plans = allPlans.filter((p) => p.card_id === card.id);
    let guard = 0;

    while (Cards.cutDateFor(card, mk) <= today && guard < MAX_MONTHS_CATCHUP) {
      guard += 1;
      const cutDay = Cards.cutDateFor(card, mk);
      const open = plans.filter((p) => !p.closed && (Number(p.remaining) || 0) > 0 && (p.date || '') <= `${cutDay}T23:59:59`);
      const st = Cards.computeStatement({ ...card, used }, open);

      if (st.total > 0) {
        // Intereses + manejo: gasto real del período y suben la deuda.
        const charges = st.interest + st.fee;
        if (charges > 0) {
          try {
            await TransactionService.addTransaction({
              id: `ccint-${card.id}-${mk}`,
              type: 'gasto',
              amount: charges,
              notes: `Intereses y manejo · ${card.name}`,
              date: new Date(`${cutDay}T12:00:00`).toISOString(),
              card_id: card.id,
              is_card_charge: true,
            });
            used += charges;
          } catch {
            // duplicado (otro dispositivo ya lo procesó): no sumar de nuevo
          }
        }

        // Factura del pago, vence en la fecha límite.
        const due = Cards.dueDateAfterCut(card, cutDay);
        try {
          await Bills.addBillWithId({
            id: `ccbill-${card.id}-${mk}`,
            name: `Pago ${card.name}`,
            amount: st.total,
            kind: 'once',
            date: due,
            remindDaysBefore: 2,
            card_id: card.id,
          });
        } catch {
          // duplicado: ya existe la factura de este corte
        }

        // Descontar la cuota de capital de cada plan.
        for (const u of st.planUpdates) {
          const plan = plans.find((p) => p.id === u.id);
          if (plan) { plan.remaining = u.remaining; plan.closed = u.closed; }
          await Cards.updatePlan(u.id, { remaining: u.remaining, closed: u.closed }).catch(() => {});
        }
        statements += 1;
      }

      lastCut = mk;
      mk = nextMonthKey(mk);
    }

    if (lastCut !== card.last_cut || used !== (Number(card.used) || 0)) {
      await BucketService.updateBucketById(card.id, { last_cut: lastCut, used }).catch(() => {});
    }
  }

  return statements;
};
