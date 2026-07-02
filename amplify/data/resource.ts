import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

// Esquema de datos de EzMoniManager (AppSync + DynamoDB).
// Refleja el modelo unificado actual: Account, Transaction, Bucket
// (budget|saving|debt|investment), Category, ReportConfig y DeviceToken.
// Autorización por dueño: cada usuario solo ve y edita lo suyo.
const schema = a.schema({
  Account: a
    .model({
      name: a.string().required(),
      currency: a.string().required(),
      color: a.string(),
      transactions: a.hasMany('Transaction', 'accountId'),
    })
    .authorization((allow) => [allow.owner()]),

  Transaction: a
    .model({
      type: a.enum(['ingreso', 'gasto', 'ahorro']),
      amount: a.float().required(),
      currency: a.string().required(),
      notes: a.string(),
      date: a.datetime().required(),
      accountId: a.id(),
      account: a.belongsTo('Account', 'accountId'),
      bucketId: a.id(),
      bucket: a.belongsTo('Bucket', 'bucketId'),
      categoryId: a.id(),
      category: a.belongsTo('Category', 'categoryId'),
    })
    .authorization((allow) => [allow.owner()]),

  Bucket: a
    .model({
      kind: a.enum(['budget', 'saving', 'debt', 'investment']),
      name: a.string().required(),
      total: a.float().required(),
      used: a.float().default(0),
      dueDate: a.date(),
      apr: a.float(),
      installments: a.integer(),
      transactions: a.hasMany('Transaction', 'bucketId'),
    })
    .authorization((allow) => [allow.owner()]),

  Category: a
    .model({
      name: a.string().required(),
      icon: a.string(),
      type: a.enum(['ingreso', 'gasto', 'ahorro']),
      transactions: a.hasMany('Transaction', 'categoryId'),
    })
    .authorization((allow) => [allow.owner()]),

  ReportConfig: a
    .model({
      name: a.string().required(),
      filters: a.json(),
    })
    .authorization((allow) => [allow.owner()]),

  DeviceToken: a
    .model({
      token: a.string().required(),
      platform: a.enum(['ios', 'android', 'web']),
    })
    .authorization((allow) => [allow.owner()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});
