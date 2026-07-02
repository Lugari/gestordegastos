import * as Crypto from 'expo-crypto';

import { makeCloudCollection } from './cloudCollection';

// Configuraciones de reporte guardadas, sincronizadas en la nube, para re-ejecutarlas.
const col = makeCloudCollection('ReportConfig');

export const getAllReports = () => col.getAll();

export const saveReport = (name, config) =>
  col.add({ id: Crypto.randomUUID(), name: name.trim(), config, created_at: new Date().toISOString() });

export const deleteReportById = (id) => col.remove(id);
