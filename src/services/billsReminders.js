import { getAllBills, nextUnpaidOccurrence } from './billsService';
import { scheduleReminder, cancelReminder } from './notificationsService';
import { money } from '../utils/formatMoney';

// (Re)programa el recordatorio local de cada factura: N días antes del próximo
// vencimiento NO pagado, a las 9:00. Se llama al abrir la app; scheduleReminder
// reemplaza el aviso anterior de la misma clave, así que es idempotente.
// En web es no-op (las notificaciones locales solo existen en móvil).
export const syncBillReminders = async () => {
  const bills = await getAllBills();
  for (const bill of bills) {
    const key = `bill-${bill.id}`;
    const due = bill.active ? nextUnpaidOccurrence(bill) : null;
    if (!due) {
      await cancelReminder(key);
      continue;
    }
    const [y, m, d] = due.split('-').map(Number);
    const before = Math.max(0, Number(bill.remind_days_before) ?? 1);
    let when = new Date(y, m - 1, d - before, 9, 0, 0);
    // Si el aviso anticipado ya pasó pero el vencimiento no, avisa el mismo día.
    if (when.getTime() <= Date.now()) when = new Date(y, m - 1, d, 9, 0, 0);
    const amountTxt = bill.amount ? ` (${money(bill.amount)})` : '';
    await scheduleReminder(
      key,
      'Factura por vencer',
      `"${bill.name}" vence el ${due}${amountTxt}.`,
      when,
    );
  }
};
