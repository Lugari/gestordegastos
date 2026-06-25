import { Platform } from 'react-native';

import { INCOME_CATEGORY } from '../constants/reportTypes';

// Exportación de reportes a CSV y PDF, multiplataforma:
// - Web: descarga de Blob (CSV) / ventana de impresión (PDF).
// - Nativo (Expo): expo-file-system + expo-sharing (CSV) y expo-print (PDF).

const money = (n) => '$' + Math.round(Number(n) || 0).toLocaleString('es-CO');
const csvEscape = (s) => `"${String(s ?? '').replace(/"/g, '""')}"`;
const fmtDate = (d) => new Date(d).toLocaleDateString('es-CO');

// id de categoría -> nombre, a partir del desglose ya calculado.
const buildCategoryNameMap = (report) => {
  const map = new Map();
  report.byCategory.forEach((c) => map.set(c.id, c.name));
  return map;
};
const categoryIdOf = (t) => (t.type === 'ingreso' ? INCOME_CATEGORY.id : (t.budget_id ?? t.target_id ?? '__none__'));

// ---------- CSV ----------
export const buildCSV = (report, meta) => {
  const names = buildCategoryNameMap(report);
  const lines = [];
  lines.push(`${csvEscape(meta.title)}`);
  lines.push(`Periodo,${csvEscape(meta.period)}`);
  lines.push('');
  lines.push('Resumen,Monto');
  lines.push(`Ingresos,${report.totalIncome}`);
  lines.push(`Gastos,${report.totalExpense}`);
  lines.push(`Ahorros,${report.totalSavings}`);
  lines.push(`Neto,${report.net}`);
  lines.push('');
  lines.push('Categoria,Total,Movimientos');
  report.byCategory.forEach((c) => lines.push(`${csvEscape(c.name)},${c.total},${c.count}`));
  lines.push('');
  lines.push('Fecha,Tipo,Categoria,Nota,Monto');
  report.transactions.forEach((t) => {
    lines.push([
      csvEscape(fmtDate(t.date)),
      t.type,
      csvEscape(names.get(categoryIdOf(t)) || 'Sin categoría'),
      csvEscape(t.notes),
      Number(t.amount) || 0,
    ].join(','));
  });
  return lines.join('\n');
};

// ---------- PDF (HTML) ----------
export const buildHTML = (report, meta) => {
  const names = buildCategoryNameMap(report);
  const catRows = report.byCategory
    .map((c) => `<tr><td>${c.name}</td><td class="num">${money(c.total)}</td><td class="num">${c.count}</td></tr>`)
    .join('');
  const txRows = report.transactions
    .map((t) => `<tr><td>${fmtDate(t.date)}</td><td>${t.type}</td><td>${names.get(categoryIdOf(t)) || 'Sin categoría'}</td><td>${t.notes || ''}</td><td class="num">${money(t.amount)}</td></tr>`)
    .join('');

  return `<!DOCTYPE html><html><head><meta charset="utf-8"/>
  <style>
    body{font-family:-apple-system,Roboto,Helvetica,sans-serif;color:#222;padding:24px;}
    h1{font-size:22px;margin:0 0 4px;} .muted{color:#777;margin:0 0 16px;}
    .kpis{display:flex;gap:12px;margin:16px 0;}
    .kpi{flex:1;border:1px solid #eee;border-radius:8px;padding:10px;}
    .kpi b{display:block;font-size:11px;color:#888;} .kpi span{font-size:18px;font-weight:bold;}
    h2{font-size:15px;margin:20px 0 6px;border-bottom:2px solid #eee;padding-bottom:4px;}
    table{width:100%;border-collapse:collapse;font-size:12px;}
    th,td{text-align:left;padding:6px 8px;border-bottom:1px solid #f0f0f0;}
    th{color:#666;text-transform:uppercase;font-size:10px;}
    .num{text-align:right;}
    .green{color:#228B22;} .red{color:#D76A61;}
  </style></head><body>
    <h1>${meta.title}</h1>
    <p class="muted">${meta.period}</p>
    <div class="kpis">
      <div class="kpi"><b>INGRESOS</b><span class="green">${money(report.totalIncome)}</span></div>
      <div class="kpi"><b>GASTOS</b><span class="red">${money(report.totalExpense)}</span></div>
      <div class="kpi"><b>NETO</b><span>${money(report.net)}</span></div>
    </div>
    <h2>Por categoría</h2>
    <table><tr><th>Categoría</th><th class="num">Total</th><th class="num">Mov.</th></tr>${catRows}</table>
    <h2>Movimientos (${report.count})</h2>
    <table><tr><th>Fecha</th><th>Tipo</th><th>Categoría</th><th>Nota</th><th class="num">Monto</th></tr>${txRows}</table>
  </body></html>`;
};

// ---------- Triggers ----------
const downloadWeb = (content, filename, type) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const printWeb = (html) => {
  const w = window.open('', '_blank');
  if (!w) throw new Error('El navegador bloqueó la ventana de impresión.');
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 300);
};

/**
 * Exporta el reporte en el formato indicado.
 * @param {'csv'|'pdf'} format
 * @param {object} report - resultado de useReportData
 * @param {{title:string, period:string}} meta
 */
export const exportReport = async (format, report, meta) => {
  if (!report || report.count === 0) {
    throw new Error('No hay datos para exportar.');
  }

  if (format === 'csv') {
    const csv = buildCSV(report, meta);
    const filename = `reporte_${Date.now()}.csv`;
    if (Platform.OS === 'web') {
      downloadWeb(csv, filename, 'text/csv;charset=utf-8;');
      return;
    }
    const FileSystem = require('expo-file-system');
    const Sharing = require('expo-sharing');
    const uri = FileSystem.cacheDirectory + filename;
    await FileSystem.writeAsStringAsync(uri, csv, { encoding: FileSystem.EncodingType.UTF8 });
    await Sharing.shareAsync(uri, { mimeType: 'text/csv', dialogTitle: 'Exportar reporte' });
    return;
  }

  // PDF
  const html = buildHTML(report, meta);
  if (Platform.OS === 'web') {
    printWeb(html);
    return;
  }
  const Print = require('expo-print');
  const Sharing = require('expo-sharing');
  const { uri } = await Print.printToFileAsync({ html });
  await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Exportar reporte' });
};
