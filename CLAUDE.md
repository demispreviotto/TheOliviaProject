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

**Puerto de desarrollo:** `localhost:5173` (Vite default)  
**Supabase Studio local:** `localhost:54323`

### Estructura de carpetas

```
src/
├── api/           # Servicios Supabase globales (cliente, tipos base)
├── assets/        # Recursos estáticos
├── components/    # Componentes UI compartidos entre features
├── features/      # Módulos por dominio (customers, products, orders, dashboard)
│   └── [feature]/
│       ├── api/           # Hooks TanStack Query → use[Name].ts
│       ├── components/    # Componentes locales del feature
│       ├── store/         # Stores Zustand → use[Name]Store.ts
│       ├── utils/         # Helpers/formatters del feature
│       ├── [Feature]Page.tsx
│       └── [Feature].styles.ts
├── layouts/       # Navbars, Sidebars
├── routes/        # Centralización de rutas (única fuente de verdad)
└── utils/         # Helpers globales
```

### Tablas principales (Supabase / PostgreSQL)

| Tabla | Descripción |
|---|---|
| `customers` | Clientes individuales y mayoristas |
| `products` | Catálogo con precios minorista/mayorista |
| `orders` | Cabecera de pedidos (estado, entrega, pago) |
| `order_items` | Detalle de ítems por pedido |
| `profiles` | Perfil del usuario autenticado (linked a `auth.users`) |

RLS habilitado en todas las tablas. Acceso completo a usuarios autenticados.

---

## Guías de estilo

- **TypeScript estricto** en todo el proyecto. Sin `any` salvo que sea imprescindible y justificado.
- **Archivos**: kebab-case para carpetas y nombres de archivo de módulos; PascalCase para componentes y tipos (`UserCard.tsx`, `CustomerType.ts`).
- **Hooks y funciones**: camelCase (`useOrders.ts`, `formatPrice.ts`).
- **Constantes**: UPPER_SNAKE_CASE.
- **Estilos**: patrón Styled-Alias con Emotion. Archivo separado `[Component].styles.ts`, importado como `import * as S from './X.styles'`.
- **Rutas**: todas centralizadas en `src/routes/`. Nunca definir rutas dentro de features.
- **Estado**:
  - Datos de Supabase → TanStack Query.
  - Estado global de UI → Zustand.
  - Estado local de componente → `useState`.
- **Schema de BD**: nunca modificar desde el Dashboard de Supabase en producción. Flujo: Docker Studio local → `supabase db diff` → `.sql` en `/migrations` → `supabase db push`.
- **Estructura de componente** (orden obligatorio): imports → types → component definition (hooks → effects → handlers → return JSX).

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
