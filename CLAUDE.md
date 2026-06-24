# CLAUDE.md — The Olivia Project (Algo Dulce)

## Stack & Architecture

| Layer | Technology |
|---|---|
| Framework | React 19 + Vite 8 |
| Language | TypeScript 6 (strict) |
| UI | Material UI v9 + Emotion |
| Remote state | TanStack React Query v5 |
| Global UI state | Zustand v5 |
| Forms | React Hook Form v7 + Zod v4 |
| Routing | React Router DOM v7 |
| Backend / DB / Auth | Supabase (PostgreSQL + Auth) |
| Notifications | notistack |
| Input masks | react-imask |
| PDF | jspdf v4 + jspdf-autotable v5 + html2canvas v1 |
| Calendar | react-day-picker v9 |
| Touch gestures | react-swipeable v7 |
| Testing | Vitest v4 + Testing Library React v16 |

**Dev port:** `localhost:5173` (Vite default)  
**Local Supabase Studio:** `localhost:54323`

### Folder Structure

```
src/
├── api/
│   └── supabase.ts            # Supabase client singleton
├── assets/                    # Static assets
│   ├── logo.tsx               # SVG logo component
│   ├── wordmark.tsx           # SVG wordmark component
│   └── Wordmark.svg
├── components/
│   ├── layout/
│   │   └── MainNavbar/        # MainNavbar.tsx + MainNavbar.styles.ts
│   └── ui/                    # Shared components (EmptyState, MaskedInput)
├── features/                  # Domain modules
│   ├── auth/                  # LoginPage.tsx + LoginPage.styles.ts
│   │   ├── components/        # LoginForm.tsx + LoginForm.styles.ts
│   │   └── store/             # useAuthStore.ts
│   ├── customers/             # CustomersPage.tsx + CustomersPage.styles.ts
│   │   ├── api/               # customer.types.ts, useCustomers, useCreateCustomer, useUpdateCustomer
│   │   ├── components/        # CustomerForm.tsx, CustomerTable.tsx
│   │   └── utils/             # customerMappings.ts
│   ├── dashboard/             # HomePage.tsx + HomePage.styles.ts
│   ├── kitchen/               # KitchenPage.tsx + KitchenPage.styles.ts
│   │   ├── api/               # kitchen.types.ts, useKitchenDashboard, useKitchenDates, useUpdateItemStatus
│   │   │   └── __tests__/     # useUpdateItemStatus.test.ts
│   │   ├── components/        # CategoryAccordion, KitchenCalendar, KitchenDateNav, KitchenFAB, PdfExportButton, ProductGroupRow
│   │   └── utils/             # kitchen.utils.ts
│   │       └── __tests__/     # kitchen.utils.test.ts
│   ├── order/                 # OrderPage.tsx + OrderPage.styles.ts, RemitoPreviewPage.tsx
│   │   ├── api/               # order.types.ts, useOrders, useCreateOrder, useUpdateOrder, useCustomerHistory
│   │   │   └── __tests__/     # useUpdateOrder.cascade.test.ts
│   │   ├── components/        # OrderForm, OrderTable, OrderRemito (each with .styles.ts)
│   │   └── utils/             # generateRemitoPdf.ts
│   └── products/              # ProductsPage.tsx
│       ├── api/               # product.types.ts, useProducts, useCreateProduct, useUpdateProduct
│       ├── components/        # ProductForm.tsx, ProductTable.tsx
│       └── utils/             # products.utils.ts
├── layouts/                   # ProtectedLayout.tsx + ProtectedLayout.styles.ts
├── routes/
│   └── index.tsx              # All routes: /, /clientes, /productos, /pedidos, /cocina, /dev/remito
├── test/
│   └── setup.ts               # Vitest global setup
└── utils/                     # Global helpers
    ├── errorMessages.ts        # getErrorMessage(error) helper
    ├── formatters.ts           # Currency and date formatters
    ├── theme.ts                # Global MUI theme
    ├── useTableSort.ts         # Generic table sorting hook
    └── validators.ts           # Shared Zod validators
```

### Testing

Tests with Vitest + Testing Library. Files in `__tests__/` inside each feature:
- `src/features/kitchen/api/__tests__/useUpdateItemStatus.test.ts`
- `src/features/kitchen/utils/__tests__/kitchen.utils.test.ts`
- `src/features/order/api/__tests__/useUpdateOrder.cascade.test.ts`

Run tests: `npm test` (run once) or `npm run test:watch`.

### Reusable Patterns in `src/utils/`

| File | Description |
|---|---|
| `useTableSort.ts` | Generic sorting hook for tables. Accepts `getValue(item, key)` defined **at module level** (outside the component) to avoid re-renders. Handles `string` (localeCompare 'es'), `number` (numeric), and ISO dates (lexicographic). Nulls always last. |
| `errorMessages.ts` | `getErrorMessage(error)` helper for friendly messages in catch blocks. |
| `formatters.ts` | Currency and date formatters. |
| `validators.ts` | Shared Zod validation helpers. |
| `theme.ts` | Global MUI theme. |

### Main Tables (Supabase / PostgreSQL)

| Table | Description |
|---|---|
| `customers` | Individual and wholesale customers; includes `tax_status` (final_consumer / simplified_taxpayer / registered_responsible / exempt) |
| `products` | Catalog with `variety` (name), `unit`, `grams`, prices and category |
| `orders` | Order headers (status, delivery, payment) |
| `order_items` | Item detail with `order_item_status` (pending → cooking → ready → delivered / cancelled) |
| `profiles` | Authenticated user profile (linked to `auth.users`) |

RLS enabled on all tables. Full access for authenticated users.

**Product categories** (`product_type_enum_v2`): `pepas`, `budin_integral`, `budin_avena`, `cookies`, `cookies_xl`, `alfajores`, `pan`, `talitas`, `galleta_marinera`, `galletitas`, `torta`.

**RPC functions**: `transition_items_to_cooking()` — transitions pending items to `cooking` when the delivery date arrives and syncs the order status.

---

## Style Guide

- **Strict TypeScript** throughout. No `any` unless strictly necessary and justified.
- **Files**: kebab-case for folders and module filenames; PascalCase for components and types (`UserCard.tsx`, `CustomerType.ts`).
- **Hooks and functions**: camelCase (`useOrders.ts`, `formatPrice.ts`).
- **Constants**: UPPER_SNAKE_CASE.
- **Styles**: Styled-Alias pattern with Emotion. Separate `[Component].styles.ts` file, imported as `import * as S from './X.styles'`. When using `styled(MuiComponent)`, always cast `as typeof MuiComponent` at the end so TypeScript correctly infers props for polymorphic components (e.g. `component={NavLink}`).
- **Routes**: all centralized in `src/routes/`. Never define routes inside features.
- **State**:
  - Supabase data → TanStack Query.
  - Global UI state → Zustand.
  - Local component state → `useState`.
- **DB schema**: never modify directly from the Supabase Dashboard in production. Workflow: local Docker Studio → `supabase db diff` → `.sql` in `/migrations` → `supabase db push`.
- **Component structure** (mandatory order): imports → types/constants → component definition (hooks → effects → handlers → return JSX).
- **Table sorting**: use `useTableSort` from `src/utils/useTableSort.ts`. Define `getValue(item, key)` at module level (outside the component). Sorting lives **inside** the table component (not in the parent page).
- **Page filtering**: status/category filtering lives in the **page** (`useMemo` over the full array) and the already-filtered array is passed to the table. Pipeline order is always: `raw data → filtering (page) → sorted (table)`.
- **Responsive navbar**: `MainNavbar` uses `display: { xs: 'none', md: 'flex' }` for desktop nav and `display: { xs: 'flex', md: 'none' }` for the mobile bar with Drawer. Add new routes only in the `NAV_ITEMS` array in `MainNavbar.tsx`.

---

## Project Rules

1. Do not introduce new features outside the plan defined in `plan.md`.
2. Never force-push to `main`.
3. Always update `plan.md` and `CLAUDE.md` when architecture or scope decisions change.
4. The only system user is the business admin/owner (no multi-tenant or complex roles for now).
5. DB migrations are versioned in `supabase/migrations/` and must never be edited once applied in production.

---

## Production Safety Rules

> **CRITICAL — Read before any action that touches data or infrastructure.**

These rules exist to prevent accidental data loss or irreversible changes to the live Supabase project.

### What counts as "production"

- Any Supabase CLI command that targets the **remote** project (i.e., commands that run without `--local` or that use the linked remote project URL/keys).
- Running `supabase db push`, `supabase functions deploy`, `supabase secrets set`, or any migration command against the remote project.
- Editing `.env` or `.env.production` values that contain live Supabase keys (`VITE_SUPABASE_URL` pointing to `*.supabase.co`, not `localhost`).
- Any script or tool call that writes, updates, or deletes rows in the live database.

### Rules

1. **Never run production-targeting commands automatically.** Before executing any command that would affect the remote Supabase project, stop and explicitly tell the user:
   - Exactly what command will run.
   - What it will change (schema, data, secrets, functions).
   - That this targets **production** and cannot be easily undone.
   - Ask for explicit confirmation before proceeding.

2. **Migrations are irreversible once pushed.** Never run `supabase db push` without user confirmation. Always show the diff (output of `supabase db diff`) first.

3. **Never delete or truncate production data.** Any `DELETE`, `TRUNCATE`, or `DROP` SQL targeting the remote DB requires explicit user approval with a clear warning.

4. **Local-first by default.** All development and testing happens against the local Supabase instance (`localhost:54323`). Only push to production when explicitly instructed by the user.

5. **No auto-deploy of Edge Functions.** Do not run `supabase functions deploy` without user confirmation.

---

## Useful Links

- [plan.md](./plan.md)
- [README.md](./README.md)
- [package.json](./package.json)
- [docs/Architecture.md](./docs/Architecture.md)
- [supabase/migrations/](./supabase/migrations/)

---

## Agent Skill: The Karpathy-Ponytail Paradigm (The Pragmatic Architect)

You operate as a highly disciplined, hyper-efficient senior engineer. You use a structured, test-driven process to ensure safety (Karpathy), but apply brutal minimalism to code implementation to prevent bloat (Ponytail).

### 1. The Karpathy Process (Safety & Execution Flow)

Before writing or executing any code, you must strictly adhere to this workflow:

- **Pause & Clarify:** If a prompt is ambiguous, stop immediately. State your assumptions and ask for clarification _before_ generating code. No guessing.
- **Goal-Driven Testing:** For bugs or functional features, your first step is to write or identify a test that reproduces the issue or validates the requirement. Iterate on code until the test passes.
- **Surgical Changes:** Keep Git diffs pristine. Do not "clean up" adjacent code, rewrite functional legacy files, or change unrelated formatting. Touch _only_ what is necessary to fulfill the goal.

### 2. The Ponytail Implementation Ladder (Code Architecture)

When implementing the solution agreed upon in the process step, stop at the first rung of this ladder that holds true:

1. **YAGNI:** Does this feature/abstraction actually need to exist right now? If no, push back.
2. **Stdlib/Native Platform:** Can native React/TS, browser features, or HTML5 native elements solve it? (e.g., native browser validations, native utility functions).
3. **Existing Stack:** Leverage the project's existing stack. Never add a new npm package if existing dependencies or a small custom function can achieve it.
4. **Minimum Viable Code:** Write the absolute minimum lines of code required to make the tests pass. Avoid single-implementation interfaces, premature factories, or unused configuration files.

### 3. Implementation Guardrails

- **Boring > Clever:** Write simple, highly readable code that a tired developer can debug at 3 AM.
- **Ceiling Comments:** Mark intentional, pragmatic simplifications with: `// hybrid: [simplification], upgrade to [X] if [Y] happens`.

### 4. Output Constraints

- State your clarifying assumptions or the test execution strategy first.
- Provide the surgical code changes.
- Keep final explanations under 3 short bullet points summarizing what was skipped or avoided. No unsolicited architectural essays.
