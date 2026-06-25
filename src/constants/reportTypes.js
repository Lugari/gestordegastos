// Modelo de configuración para los reportes personalizables.

export const TX_TYPES = [
  { value: 'ingreso', label: 'Ingresos', color: '#4AD14A' },
  { value: 'gasto', label: 'Gastos', color: '#D76A61' },
  { value: 'ahorro', label: 'Ahorros', color: '#ADC4CD' },
];

export const REPORT_MODES = [
  { value: 'simple', label: 'Simple' },
  { value: 'detailed', label: 'Detallado' },
];

// Categoría sintética para los ingresos (no tienen presupuesto/meta asociada).
export const INCOME_CATEGORY = { id: '__income__', name: 'Cuenta principal', color: '#D9D9D9' };

// Configuración por defecto de un reporte.
export const defaultReportConfig = () => ({
  mode: 'simple', // 'simple' | 'detailed'
  range: { preset: 'Mes', start: null, end: null }, // start/end solo para 'Personalizado'
  categoryIds: [], // vacío = todas las categorías
  types: TX_TYPES.map((t) => t.value), // tipos seleccionados
  template: null, // p. ej. 'freelancer' (fases siguientes)
});
