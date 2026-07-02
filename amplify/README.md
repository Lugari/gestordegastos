# Backend AWS (Amplify Gen 2)

Scaffolding de la Fase 0 del [Roadmap AWS Backend](../Project%20plan/Roadmap%20AWS%20Backend.md).

## Contenido

| Archivo | Rol |
|---|---|
| `backend.ts` | Punto de entrada: registra `auth` y `data` |
| `auth/resource.ts` | Amazon Cognito (email/contraseña; OAuth y MFA llegan en Fase 1) |
| `data/resource.ts` | Esquema AppSync + DynamoDB (Account, Transaction, Bucket, Category, ReportConfig, DeviceToken) con autorización por dueño |
| `tsconfig.json` / `package.json` | Config del subárbol TypeScript del backend |

## Requisitos previos (una vez por máquina)

1. Cuenta AWS y usuario IAM con permisos de Amplify.
2. Configurar credenciales locales:
   ```bash
   npx ampx configure profile
   ```
   (o `aws configure` con el AWS CLI).

## Desplegar un entorno de desarrollo (sandbox)

Cada desarrollador levanta su propio sandbox aislado:

```bash
npm run amplify:sandbox
```

Esto aprovisiona Cognito + AppSync + DynamoDB en tu cuenta AWS y genera
`amplify_outputs.json` en la raíz (ignorado por git). Ese archivo es el que
la app consumirá con `Amplify.configure(...)` a partir de la Fase 1.

Para eliminar el sandbox y sus recursos:

```bash
npm run amplify:sandbox:delete
```

## Producción (Fase 4)

El entorno `prod` se despliega vía Amplify Hosting conectado a la rama
principal (`ampx pipeline-deploy`), no con sandbox.

## Verificación sin desplegar

El esquema se puede typecheck sin tocar AWS:

```bash
npx tsc --noEmit -p amplify/tsconfig.json
```
