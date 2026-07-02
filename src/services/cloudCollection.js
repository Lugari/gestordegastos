import * as Crypto from 'expo-crypto';
import { generateClient } from 'aws-amplify/data';

// Cliente de datos de AppSync. Perezoso: Amplify.configure() ya corrió al arrancar
// (src/amplify.js), pero generamos el cliente en el primer uso por seguridad.
let _client;
const client = () => (_client ??= generateClient());

const throwIf = (errors, fallback) => {
  if (errors && errors.length) throw new Error(errors[0]?.message || fallback);
};

// El payload viaja como texto JSON; lo parseamos con tolerancia a fallos.
const parse = (raw) => {
  if (!raw) return {};
  try {
    return typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch {
    return {};
  }
};

// Colección documental en la nube para un modelo (Account, Transaction, …).
// Guarda cada objeto de la app en el campo `payload`, usando su propio id para
// poder actualizar y borrar. Mantiene la misma API que los servicios locales.
export const makeCloudCollection = (modelName) => {
  const model = () => client().models[modelName];

  const getAll = async () => {
    let items = [];
    let nextToken = null;
    do {
      const res = await model().list({ limit: 1000, nextToken });
      throwIf(res.errors, 'No se pudieron cargar los datos');
      items = items.concat(res.data || []);
      nextToken = res.nextToken;
    } while (nextToken);
    // Rehidrata el objeto de la app (payload es JSON en texto) y fija el id.
    return items.map((r) => ({ ...parse(r.payload), id: r.id }));
  };

  const add = async (obj) => {
    const id = obj.id || Crypto.randomUUID();
    const record = { ...obj, id };
    const res = await model().create({ id, payload: JSON.stringify(record) });
    throwIf(res.errors, 'No se pudo guardar');
    return record;
  };

  const update = async (id, updates) => {
    const res = await model().get({ id });
    throwIf(res.errors, 'No se pudo leer el registro');
    const current = parse(res.data?.payload);
    const merged = { ...current, ...updates, id };
    const upd = await model().update({ id, payload: JSON.stringify(merged) });
    throwIf(upd.errors, 'No se pudo actualizar');
    return merged;
  };

  const remove = async (id) => {
    const res = await model().delete({ id });
    throwIf(res.errors, 'No se pudo eliminar');
  };

  // Reemplaza toda la colección (usado por importación y migración).
  const replaceAll = async (objects) => {
    const existing = await getAll();
    await Promise.all(existing.map((o) => remove(o.id).catch(() => {})));
    await Promise.all((objects || []).map((o) => add(o)));
  };

  return { getAll, add, update, remove, replaceAll };
};
