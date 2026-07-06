import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

// Almacén documental por usuario. Cada modelo (Account, Transaction, Bucket,
// Category, ReportConfig, DeviceToken) guarda el objeto de la app tal cual en el
// campo `payload` (JSON), usando el id propio del objeto y autorización por dueño.
//
// La app ya carga colecciones completas y filtra/computa en el cliente, así que un
// documento por registro encaja con su arquitectura sin reescribir hooks ni pantallas.
// `payload` es texto (JSON serializado por el cliente) en vez de AWSJSON, para
// evitar problemas de coerción del tipo AWSJSON en las mutaciones de AppSync.
const owned = () =>
  a.model({ payload: a.string() }).authorization((allow) => [allow.owner()]);

const schema = a.schema({
  Account: owned(),
  Transaction: owned(),
  Bucket: owned(),
  Category: owned(),
  ReportConfig: owned(),
  DeviceToken: owned(),
  RecurringRule: owned(),
  Bill: owned(),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});
