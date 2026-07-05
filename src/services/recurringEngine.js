import * as TransactionService from './transactionService';
import * as BucketService from './bucketService';
import * as Recurring from './recurringService';
import { getStrategy } from '../domain/strategyByKind';
import { kindFromTransactionType } from '../constants/bucketKinds';
import { toBase } from '../utils/formatMoney';

// Motor de recurrencias: al abrir la app, genera las transacciones vencidas de
// cada regla activa ("ponerse al día") y avanza su próxima fecha.
//
// Anti-duplicados multi-dispositivo: el id de cada transacción generada es
// determinístico (`rec-<ruleId>-<fecha>`); si otro dispositivo ya la creó, la
// nube rechaza el duplicado y aquí simplemente se ignora.
const MAX_OCCURRENCES_PER_RULE = 60; // tope de seguridad de "ponerse al día"

// Ajusta el saldo del bucket vinculado (misma lógica que al crear una transacción manual).
const applyBucketDelta = async (targetId, targetKind, signedAmount) => {
  if (!targetId || !targetKind) return;
  const strategy = getStrategy(targetKind);
  if (!strategy?.applyTransaction) return;
  const buckets = await BucketService.getAllBuckets();
  const bucket = buckets.find((b) => b.id === targetId);
  if (!bucket) return;
  await BucketService.updateBucketById(targetId, strategy.applyTransaction(bucket, signedAmount));
};

export const catchUpRecurring = async () => {
  const today = Recurring.toDayString(new Date());
  let generated = 0;

  const rules = await Recurring.getAllRules();
  for (const rule of rules) {
    if (!rule.active || !rule.next_run || !rule.template) continue;

    let nextRun = rule.next_run;
    let guard = 0;

    while (nextRun <= today && guard < MAX_OCCURRENCES_PER_RULE) {
      guard += 1;
      const txId = `rec-${rule.id}-${nextRun}`;
      const t = rule.template;
      try {
        await TransactionService.addTransaction({
          ...t,
          id: txId,
          date: Recurring.occurrenceDate(nextRun).toISOString(),
          recurring_rule_id: rule.id,
        });
        // Solo ajusta el bucket si la creación fue nuestra (no duplicada).
        const targetKind = t.target_kind ?? kindFromTransactionType(t.type);
        const targetId = t.target_id ?? t.budget_id ?? null;
        await applyBucketDelta(targetId, targetKind, toBase(t.amount, t.currency));
        generated += 1;
      } catch {
        // Duplicado (otro dispositivo se adelantó) o fallo transitorio: no ajustar saldo.
      }
      nextRun = Recurring.advanceNextRun(rule, nextRun);
    }

    if (nextRun !== rule.next_run) {
      await Recurring.updateRule(rule.id, { next_run: nextRun }).catch(() => {});
    }
  }

  return generated;
};
