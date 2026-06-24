// Utilidades para el filtrado de transacciones por fecha.
// Cada periodo se interpreta como "el periodo actual que contiene hoy".

const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const endOfDay = (date) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

/**
 * Devuelve el rango { start, end } para un filtro dado, o null si no aplica
 * (sin filtrado por fecha).
 *
 * @param {string} filter - 'Semana' | 'Mes' | 'Trimestre' | 'Año' | 'Personalizado'
 * @param {{start: Date, end: Date}|null} customRange - rango para 'Personalizado'
 * @returns {{start: Date, end: Date}|null}
 */
export const getDateRange = (filter, customRange) => {
  const now = new Date();

  switch (filter) {
    case 'Semana': {
      // Semana actual de lunes a domingo.
      const day = (now.getDay() + 6) % 7; // lunes = 0
      const start = startOfDay(now);
      start.setDate(now.getDate() - day);
      const end = endOfDay(start);
      end.setDate(start.getDate() + 6);
      return { start, end };
    }
    case 'Mes': {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = endOfDay(new Date(now.getFullYear(), now.getMonth() + 1, 0));
      return { start, end };
    }
    case 'Trimestre': {
      const q = Math.floor(now.getMonth() / 3);
      const start = new Date(now.getFullYear(), q * 3, 1);
      const end = endOfDay(new Date(now.getFullYear(), q * 3 + 3, 0));
      return { start, end };
    }
    case 'Año': {
      const start = new Date(now.getFullYear(), 0, 1);
      const end = endOfDay(new Date(now.getFullYear(), 11, 31));
      return { start, end };
    }
    case 'Personalizado': {
      if (!customRange?.start || !customRange?.end) return null;
      return { start: startOfDay(customRange.start), end: endOfDay(customRange.end) };
    }
    default:
      return null;
  }
};

/**
 * Indica si una fecha (string ISO o Date) cae dentro del rango dado.
 */
export const isWithinRange = (date, range) => {
  if (!range) return true;
  const d = new Date(date);
  return d >= range.start && d <= range.end;
};
