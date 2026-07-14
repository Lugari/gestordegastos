# Respuestas para el formulario Data Safety (Google Play Console)

Guía para completar **Play Console → Política de la app → Seguridad de los datos**.
Refleja el comportamiento real de la app a 2026-07-13. Si la app cambia (p. ej. se
añade analítica o push server-side), hay que actualizar el formulario Y la política.

## Preguntas generales

| Pregunta | Respuesta |
|---|---|
| ¿Tu app recopila o comparte alguno de los tipos de datos de usuario requeridos? | **Sí** (recopila; no comparte) |
| ¿Todos los datos de usuario que recopila tu app se cifran en tránsito? | **Sí** (TLS a Cognito/AppSync) |
| ¿Ofreces una forma de solicitar la eliminación de los datos? | **Sí** — borrado in-app (Más → Eliminar cuenta) + URL pública de la política, sección 5 |

## Tipos de datos recopilados

### Información personal
- **Correo electrónico** — Recopilado: Sí · Compartido: No · Procesado efímeramente: No · Obligatorio: Sí (solo para cuentas; el modo sin cuenta no lo pide)
  - Fines: **Funcionalidad de la app, Gestión de la cuenta** (autenticación y recuperación)
- **Nombre** — Recopilado: Sí (opcional) · Compartido: No
  - Fines: **Funcionalidad de la app** (personalización del saludo)

### Información financiera
- **Otra información financiera** (transacciones, presupuestos, deudas, inversiones que el usuario registra manualmente) — Recopilado: Sí · Compartido: No
  - Fines: **Funcionalidad de la app** (es el propósito de la app)
  - Nota: NO se recopilan números de tarjetas, cuentas bancarias reales ni credenciales bancarias. Los montos/nombres los escribe el usuario.

### Lo que NO se recopila (marcar "No" en todo lo demás)
- Ubicación, contactos, fotos/videos, audio, archivos, historial web, identificadores de dispositivo o publicidad, información de salud, mensajes, actividad en apps, información de apps instaladas, calendario, registros (crash logs/diagnóstico — no hay SDK de crash reporting hoy).

## Prácticas de seguridad
- Datos cifrados en tránsito: **Sí**
- El usuario puede solicitar que se eliminen los datos: **Sí**
- Mecanismo: eliminación in-app inmediata (cuenta + todos los registros) o solicitud por correo (máx. 30 días). URL: la política de privacidad publicada, sección 5.

## Cuenta y eliminación (requisito de "Account deletion")
- ¿La app permite crear cuenta? **Sí** (también funciona sin cuenta)
- URL de eliminación de cuenta (requerida por Play): usar la URL pública de
  `privacidad.html` (sección 5), p. ej. `https://lugari.github.io/gestordegastos/privacidad.html`

## Recordatorios de coherencia
- La URL de la política va TAMBIÉN en Play Console → Presencia en la tienda → Ficha.
- La política menciona open.er-api.com (tasas de cambio, sin datos personales): no es
  "compartir datos" según Play porque no se envía ningún dato de usuario.
