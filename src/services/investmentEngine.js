import * as BucketService from './bucketService';
import * as Investments from './investmentService';
import { scheduleReminder, notifyNow } from './notificationsService';

// Motor de inversiones: al abrir la app, causa los rendimientos de la renta
// fija hasta hoy (interés compuesto E.A.) y avisa de los vencimientos.
//
// Idempotencia: `last_accrual` (YYYY-MM-DD) marca hasta qué día se causó; solo
// se causan los días nuevos. El valor de mercado sube y queda como ganancia
// NO realizada (no genera ingreso hasta que se retira).
export const catchUpInvestments = async () => {
  const today = Investments.toDayString(new Date());
  const all = await BucketService.getBucketsByKind('investment');
  const fixed = all.filter((i) => Investments.isFixedIncome(i) && Number(i.roi) > 0);
  let accrued = 0;

  for (const inv of fixed) {
    const from = inv.last_accrual || inv.open_date || Investments.toDayString(new Date(inv.created_at || Date.now()));
    const { interest, days, throughDay } = Investments.computeAccrual(inv, from, today);

    if (days > 0 && interest !== 0) {
      await Investments.addAccrualMove(inv, interest, 'Rendimiento causado').catch(() => {});
      await BucketService.updateBucketById(inv.id, {
        current_value: Investments.currentValue(inv) + interest,
        last_accrual: throughDay,
      }).catch(() => {});
      accrued += 1;
    } else if (throughDay !== from) {
      await BucketService.updateBucketById(inv.id, { last_accrual: throughDay }).catch(() => {});
    }

    // Aviso de vencimiento: notificación local el día del vencimiento a las 9:00.
    if (inv.maturity_date) {
      const key = `inv-mat-${inv.id}`;
      if (inv.maturity_date <= today && !inv.matured_notified) {
        await notifyNow('Inversión vencida', `Tu inversión "${inv.name}" llegó a su vencimiento. Puedes renovarla o redimirla.`).catch(() => {});
        await BucketService.updateBucketById(inv.id, { matured_notified: true }).catch(() => {});
      } else if (inv.maturity_date > today) {
        const [y, m, d] = inv.maturity_date.split('-').map(Number);
        const when = new Date(y, m - 1, d, 9, 0, 0);
        await scheduleReminder(key, 'Vencimiento de inversión', `"${inv.name}" vence hoy.`, when).catch(() => {});
      }
    }
  }
  return accrued;
};
