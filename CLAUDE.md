# CLAUDE.md — The Olivia Project (Algo Dulce)

## Stack y arquitectura

| Capa | Tecnología |
|---|---|
| Framework | React 19 + Vite 8 |
| Lenguaje | TypeScript 6 (strict) |
| UI | Material UI v9 + Emotion |
| Estado remoto | TanStack React Query v5 |
| Estado global UI | Zustand v5 |
| Formularios | React Hook Form v7 + Zod v4 |
| Routing | React Router DOM v7 |
| Backend / DB / Auth | Supabase (PostgreSQL + Auth) |
| Notificaciones | notistack |
| Máscaras de input | react-imask |
| PDF | jspdf v4 + jspdf-autotable v5 + html2canvas v1 |
| Calendario | react-day-picker v9 |
| Gestos táctiles | react-swipeable v7 |
| Testing | Vitest v4 + Testing Library React v16 |

**Puerto de desarrollo:** `localhost:5173` (Vite default)  
**Supabase Studio local:** `localhost:54323`

### Estructura de carpetas

```
src/
├── api/           # Servicios Supabase globales (cliente, tipos base)
├── assets/        # Recursos estáticos (SVG: logo.tsx, wordmark.tsx)
├── components/
│   ├── layout/    # MainNavbar
│   └── ui/        # Componentes compartidos (EmptyState, MaskedInput)
├── features/      # Módulos por dominio
│   ├── auth/      # Login (LoginPage, LoginForm, useAuthStore)
│   ├── customers/ # CRUD clientes (CustomersPage)
│   ├── dashboard/ # Home (HomePage)
│   ├── kitchen/   # Dashboard cocina (KitchenPage + sub-componentes)
│   ├── order/     # Pedidos + remito PDF (OrderPage, RemitoPreviewPage)
│   └── products/  # Catálogo (ProductsPage)
│       └── [feature]/
│           ├── api/           # Hooks TanStack Query → use[Name].ts + [feature].types.ts
│           ├── components/    # Componentes locales del feature
│           ├── store/         # Stores Zustand → use[Name]Store.ts
│           ├── utils/         # Helpers/formatters del feature
│           ├── [Feature]Page.tsx
│           └── [Feature].styles.ts
├── layouts/       # ProtectedLayout (wrapper de rutas autenticadas)
├── routes/        # Centralización de rutas (única fuente de verdad)
│   └── index.tsx  # Rutas: /, /clientes, /productos, /pedidos, /cocina, /dev/remito
└── utils/         # Helpers globales (errorMessages, formatters, theme, validators)
```

### Testing

Tests con Vitest + Testing Library. Archivos en `__tests__/` dentro de cada feature:
- `src/features/kitchen/api/__tests__/useUpdateItemStatus.test.ts`
- `src/features/kitchen/utils/__tests__/kitchen.utils.test.ts`
- `src/features/order/api/__tests__/useUpdateOrder.cascade.test.ts`

Correr tests: `npm test` (run once) o `npm run test:watch`.

### Patrones reutilizables en `src/utils/`

| Archivo | Descripción |
|---|---|
| `useTableSort.ts` | Hook genérico de sorting para tablas. Acepta `getValue(item, key)` definido **a nivel de módulo** (fuera del componente) para evitar re-renders. Maneja `string` (localeCompare 'es'), `number` (numérico), e ISO dates (lexicográfico). Nulls siempre al final. |
| `errorMessages.ts` | Helper `getErrorMessage(error)` para mensajes amigables en catch blocks. |
| `formatters.ts` | Formatters de moneda y fecha. |
| `validators.ts` | Helpers de validación Zod compartidos. |
| `theme.ts` | Tema MUI global. |

### Tablas principales (Supabase / PostgreSQL)

| Tabla | Descripción |
|---|---|
| `customers` | Clientes individuales y mayoristas; incluye `tax_status` (final_consumer / simplified_taxpayer / registered_responsible / exempt) |
| `products` | Catálogo con `variety` (nombre), `unit`, `grams`, precios y categoría |
| `orders` | Cabecera de pedidos (estado, entrega, pago) |
| `order_items` | Detalle de ítems con `order_item_status` (pending → cooking → ready → delivered / cancelled) |
| `profiles` | Perfil del usuario autenticado (linked a `auth.users`) |

RLS habilitado en todas las tablas. Acceso completo a usuarios autenticados.

**Categorías de productos** (`product_type_enum_v2`): `pepas`, `budin_integral`, `budin_avena`, `cookies`, `cookies_xl`, `alfajores`, `pan`, `talitas`, `galleta_marinera`, `galletitas`, `torta`.

**RPC functions**: `transition_items_to_cooking()` — pasa ítems pendientes a `cooking` cuando llega la fecha de entrega y sincroniza el estado del pedido.

---

## Guías de estilo

- **TypeScript estricto** en todo el proyecto. Sin `any` salvo que sea imprescindible y justificado.
- **Archivos**: kebab-case para carpetas y nombres de archivo de módulos; PascalCase para componentes y tipos (`UserCard.tsx`, `CustomerType.ts`).
- **Hooks y funciones**: camelCase (`useOrders.ts`, `formatPrice.ts`).
- **Constantes**: UPPER_SNAKE_CASE.
- **Estilos**: patrón Styled-Alias con Emotion. Archivo separado `[Component].styles.ts`, importado como `import * as S from './X.styles'`. Al hacer `styled(MuiComponent)`, siempre castear `as typeof MuiComponent` al final para que TypeScript infiera correctamente las props del componente polimorfo (ej: `component={NavLink}`).
- **Rutas**: todas centralizadas en `src/routes/`. Nunca definir rutas dentro de features.
- **Estado**:
  - Datos de Supabase → TanStack Query.
  - Estado global de UI → Zustand.
  - Estado local de componente → `useState`.
- **Schema de BD**: nunca modificar desde el Dashboard de Supabase en producción. Flujo: Docker Studio local → `supabase db diff` → `.sql` en `/migrations` → `supabase db push`.
- **Estructura de componente** (orden obligatorio): imports → types/constants → component definition (hooks → effects → handlers → return JSX).
- **Sorting en tablas**: usar `useTableSort` de `src/utils/useTableSort.ts`. Definir `getValue(item, key)` a nivel de módulo (fuera del componente). El sorting vive **dentro** del componente tabla (no en la página padre).
- **Filtrado en páginas**: el filtrado por estado/categoría vive en la **página** (`useMemo` sobre el array completo) y se pasa el array ya filtrado a la tabla. El orden de pipeline es siempre: `datos crudos → filtrado (página) → sorted (tabla)`.
- **Navbar responsiva**: `MainNavbar` usa `display: { xs: 'none', md: 'flex' }` para el nav de escritorio y `display: { xs: 'flex', md: 'none' }` para el bar móvil con Drawer. Agregar nuevas rutas únicamente en el array `NAV_ITEMS` en `MainNavbar.tsx`.

---

## Reglas de proyecto

1. No introducir features nuevas fuera del plan definido en `plan.md`.
2. No hacer force push a `main`.
3. Siempre actualizar `plan.md` y `CLAUDE.md` cuando cambien decisiones de arquitectura o alcance.
4. El único usuario del sistema es el administrador/dueño del negocio (no hay multi-tenant ni roles complejos por ahora).
5. Las migraciones de BD se versionan en `supabase/migrations/` y nunca se editan una vez aplicadas en producción.

---

## Enlaces útiles

- [plan.md](./plan.md)
- [README.md](./README.md)
- [package.json](./package.json)
- [docs/Architecture.md](./docs/Architecture.md)
- [supabase/migrations/](./supabase/migrations/)
