import { useMemo } from 'react';

import { useGetTransactions } from './useTransactionData';
import { useGetBudgets } from './useBudgetsData';
import { useGetSavings } from './useSavingsData';
import { useCurrency } from '../context/CurrencyContext';
import { getDateRange, isWithinRange } from '../utils/dateRange';
import { INCOME_CATEGORY } from '../constants/reportTypes';

// Capa de agregación de los reportes. Filtra las transacciones según la
// configuración (rango de fechas, tipos, categorías) y devuelve los totales y
// desgloses listos para renderizar o exportar.
//
// Reutiliza getDateRange/isWithinRange (los mismos del historial) para el rango.
export const useReportData = (config) => {
  const { data: transactions = [], isLoading: loadingTx } = useGetTransactions();
  const { data: budgets = [], isLoading: loadingB } = useGetBudgets();
  const { data: savings = [], isLoading: loadingS } = useGetSavings();
  const { convert, baseCurrency } = useCurrency();

  // Índice id -> { name, color } para resolver las categorías (presupuestos + metas).
  const categoryIndex = useMemo(() => {
    const map = new Map();
    budgets.forEach((b) => map.set(b.id, { id: b.id, name: b.name, color: b.color }));
    savings.forEach((s) => map.set(s.id, { id: s.id, name: s.name, color: s.color }));
    return map;
  }, [budgets, savings]);

  const result = useMemo(() => {
    const range = getDateRange(config.range.preset, {
      start: config.range.start,
      end: config.range.end,
    });
    const typeSet = new Set(config.types);
    const catSet = new Set(config.categoryIds);

    const filtered = transactions
      .filter((t) => {
        if (!isWithinRange(t.date, range)) return false;
        if (!typeSet.has(t.type)) return false;
        if (catSet.size > 0) {
          const cid = t.budget_id ?? t.target_id ?? null;
          if (!cid || !catSet.has(cid)) return false;
        }
        return true;
      })
      // Normalizamos cada monto a la moneda base para que todo el reporte sea comparable.
      .map((t) => ({ ...t, amount: convert(parseFloat(t.amount) || 0, t.currency || baseCurrency, baseCurrency) }));

    const byType = { ingreso: 0, gasto: 0, ahorro: 0 };
    const byCatMap = new Map();

    filtered.forEach((t) => {
      const amount = parseFloat(t.amount) || 0;
      byType[t.type] = (byType[t.type] || 0) + amount;

      const meta =
        t.type === 'ingreso'
          ? INCOME_CATEGORY
          : categoryIndex.get(t.budget_id ?? t.target_id) || {
              id: '__none__',
              name: 'Sin categoría',
              color: '#D9D9D9',
            };
      const current = byCatMap.get(meta.id) || { ...meta, total: 0, count: 0, type: t.type };
      current.total += amount;
      current.count += 1;
      byCatMap.set(meta.id, current);
    });

    // Serie temporal (ingresos vs egresos por día) para la vista Simple.
    const sorted = [...filtered].sort((a, b) => new Date(a.date) - new Date(b.date));
    const labelOf = (d) => new Date(d).toLocaleDateString('es-CO', { month: 'short', day: 'numeric' });
    const labels = [...new Set(sorted.map((t) => labelOf(t.date)))];
    const income = {};
    const expense = {};
    labels.forEach((l) => {
      income[l] = 0;
      expense[l] = 0;
    });
    sorted.forEach((t) => {
      const l = labelOf(t.date);
      const amount = parseFloat(t.amount) || 0;
      if (t.type === 'ingreso') income[l] += amount;
      else if (t.type === 'gasto') expense[l] += amount;
    });

    return {
      transactions: filtered,
      count: filtered.length,
      totalIncome: byType.ingreso,
      totalExpense: byType.gasto,
      totalSavings: byType.ahorro,
      net: byType.ingreso - byType.gasto,
      byType,
      byCategory: [...byCatMap.values()].sort((a, b) => b.total - a.total),
      timeSeries: {
        labels,
        income: labels.map((l) => income[l]),
        expense: labels.map((l) => expense[l]),
      },
    };
  }, [transactions, categoryIndex, config, convert, baseCurrency]);

  return { ...result, isLoading: loadingTx || loadingB || loadingS };
};
