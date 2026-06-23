# 💰 Gestor de Gastos

Aplicación móvil de finanzas personales construida con **React Native + Expo**. Permite registrar transacciones, gestionar presupuestos, fijar metas de ahorro, llevar el control de deudas y visualizar reportes — todo almacenado de forma local en el dispositivo.

> Toda la información se persiste **localmente** en el dispositivo mediante `AsyncStorage`; la app funciona sin conexión y sin backend.

---

## ✨ Funcionalidades

| Módulo | Descripción |
|--------|-------------|
| 🔐 **Autenticación** | Login básico con persistencia de sesión vía token en `AsyncStorage` (`AuthContext`). |
| 💸 **Transacciones** | Alta, edición y eliminación de movimientos clasificados como *ingreso*, *gasto* o *ahorro*. Cada transacción puede vincularse a un presupuesto o meta. |
| 📊 **Presupuestos** | Creación de presupuestos por categoría con seguimiento de monto total y usado. Se descuentan automáticamente al registrar gastos asociados. |
| 🎯 **Metas de Ahorro** | Definición de objetivos de ahorro con progreso (total vs. acumulado). |
| 🏦 **Deudas** | Registro de deudas con monto total, tasa de interés (APR) y número de cuotas. |
| 🏷️ **Categorías** | Gestión de categorías personalizadas con selector de iconos. |
| 📈 **Reportes** | Gráficos de distribución de gastos (pastel) y tendencia ingresos vs. egresos (líneas) con `react-native-chart-kit`. |
| 🏠 **Inicio (Home)** | Resumen de balance total, ingresos, gastos y vista rápida de los principales presupuestos y metas. |
| 🌐 **Internacionalización** | Soporte para español (por defecto) e inglés mediante `i18next`. |

---

## 🛠️ Tecnologías y herramientas

- **[Expo](https://expo.dev/) SDK 53** + **React Native 0.79** (con `expo-dev-client`)
- **React 19**
- **[React Navigation](https://reactnavigation.org/)** (`native-stack`) para la navegación
- **[TanStack React Query](https://tanstack.com/query)** para gestión de estado del servidor/caché y mutaciones
- **[AsyncStorage](https://react-native-async-storage.github.io/async-storage/)** como capa de persistencia local
- **[react-native-chart-kit](https://github.com/indiespirit/react-native-chart-kit)** + `react-native-svg` para gráficos
- **[i18next](https://www.i18next.com/)** / `react-i18next` para internacionalización
- **expo-crypto** para generación de IDs únicos (`randomUUID`)
- **react-native-gesture-handler** y **react-native-reanimated** para gestos y animaciones
- **axios** (capa de API legada apuntando a un servidor JSON)
- **[EAS Build](https://docs.expo.dev/build/introduction/)** para la generación de builds (APK / producción)

---

## 📁 Estructura del proyecto

```
src/
├── api/              # Capa de API legada (axios) + datos de ejemplo (db.json)
├── assets/           # Imágenes y recursos estáticos
├── components/       # Componentes reutilizables, organizados por dominio
│   ├── budgets/      #   presupuestos
│   ├── categories/   #   categorías
│   ├── debts/        #   deudas
│   ├── savings/      #   ahorros
│   ├── transactions/ #   transacciones
│   └── ...           #   genéricos (FAB, Header, PrimaryButton, etc.)
├── constants/        # Tema (colores, tamaños, fuentes) e iconos
├── context/          # AuthContext (sesión de usuario)
├── hooks/            # Hooks de datos basados en React Query (useXData)
│                     #   y hooks locales (useTransactions, useBudgets)
├── screens/          # Pantallas de la app (Home, Add*, Single*, Reports...)
├── services/         # Lógica de persistencia por dominio sobre AsyncStorage
├── App.js            # Providers (QueryClient, Auth) y navegador principal
└── index.js          # Punto de entrada (registerRootComponent)
```

### Arquitectura por capas

La aplicación sigue una separación clara de responsabilidades:

```
Pantallas (screens)  →  Hooks (React Query)  →  Servicios  →  AsyncStorage
```

- **Servicios** (`src/services/`): encapsulan el CRUD de cada dominio (`transactionService`, `budgetService`, `savingService`, `debtService`, `categoryService`) leyendo y escribiendo en `AsyncStorage` bajo claves como `@transactions`, `@budgets`, etc.
- **Hooks** (`src/hooks/`): exponen los datos a la UI. Los hooks `useXData` (p. ej. `useGetTransactions`, `useManageTransactions`) usan **React Query** con queries y mutaciones que invalidan la caché para mantener la UI sincronizada. Al añadir/eliminar una transacción se actualiza automáticamente el monto usado del presupuesto o meta vinculada.
- **Pantallas** (`src/screens/`): consumen los hooks y componen la interfaz.

---

## 🚀 Puesta en marcha

### Requisitos previos

- [Node.js](https://nodejs.org/) (LTS recomendado)
- [Expo CLI](https://docs.expo.dev/) / `npx expo`
- Un **development build** o emulador/dispositivo (la app usa `expo-dev-client`, no Expo Go estándar)

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/Lugari/gestordegastos.git
cd gestordegastos

# Instalar dependencias
npm install
```

### Ejecución

```bash
# Iniciar el servidor de desarrollo (dev client)
npm run start

# Compilar y ejecutar en Android
npm run android

# Compilar y ejecutar en iOS
npm run ios

# Ejecutar en web
npm run web
```

### Builds con EAS

El proyecto está configurado para **EAS Build** (ver `eas.json`). Perfiles disponibles:

```bash
eas build --profile apk          # APK de Android
eas build --profile development  # Development client (distribución interna)
eas build --profile preview      # Preview (distribución interna)
eas build --profile production   # Producción (auto-incremento de versión)
```

---

## 🌍 Internacionalización

Los textos se gestionan con `i18next` (`i18n.js`). Idioma por defecto: **español**, con *fallback* a inglés. Para añadir nuevas traducciones, amplía el objeto `resources` en `i18n.js`.

---

## 📝 Notas

- La carpeta `src/api/` (`api.js` con `axios` y `db.json`) corresponde a una **capa de datos legada** pensada para un backend tipo *json-server*. La versión actual de la app opera de forma totalmente **local** a través de los servicios sobre `AsyncStorage`.
- El login actual es de demostración: acepta cualquier email/contraseña y guarda el email como token de sesión.

---

## 📄 Licencia

Distribuido bajo licencia **0BSD**.
