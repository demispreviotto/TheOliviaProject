# plan.md — The Olivia Project (Algo Dulce)

## Objetivo del proyecto

CRM operativo para **Algo Dulce**, una pastelería artesanal/mayorista. El sistema centraliza la gestión diaria del negocio: clientes, catálogo de productos, pedidos (con su ciclo de vida completo desde la toma hasta la entrega), y control financiero básico para facilitar la facturación mensual ante AFIP.

El único operador es el **dueño/administrador** del negocio. No hay múltiples roles ni multi-tenant.

---

## Modelo de datos

### `customers`
| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID PK | Auto-generado |
| `category` | ENUM | `individual` \| `wholesale` |
| `tax_status` | TEXT | `final_consumer` \| `simplified_taxpayer` \| `registered_responsible` \| `exempt` |
| `full_name` | TEXT | Nombre para particulares |
| `company_name` | TEXT | Razón social para mayoristas |
| `tax_id` | TEXT | CUIT / DNI |
| `phone` | TEXT | |
| `email` | TEXT | |
| `delivery_address` | TEXT | Dirección de entrega |
| `billing_address` | TEXT | Dirección de facturación |
| `notes` | TEXT | Observaciones internas |

### `products`
| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID PK | |
| `variety` | TEXT | Nombre/variedad del producto |
| `product_category` | ENUM | `pepas`, `budin_integral`, `budin_avena`, `cookies`, `cookies_xl`, `alfajores`, `pan`, `talitas`, `galleta_marinera`, `galletitas`, `torta` |
| `unit` | NUMERIC | Unidades por presentación (default 1) |
| `grams` | NUMERIC | Peso en gramos (opcional, alternativa a unit) |
| `wholesale_price` | NUMERIC | Precio mayorista |
| `retail_price` | NUMERIC | Precio minorista |
| `is_active` | BOOLEAN | Soft delete (no afecta pedidos históricos) |

### `orders`
| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID PK | |
| `customer_id` | UUID FK | Referencia a `customers` |
| `order_status` | ENUM | `pending` → `cooking` → `ready` → `delivered` \| `cancelled` |
| `delivery_mode` | ENUM | `pickup` \| `delivery` |
| `payment_state` | ENUM | `pending` \| `partially_paid` \| `paid` |
| `pay_method` | ENUM | `cash` \| `transfer` \| `mixed` |
| `delivery_date` | DATE | Fecha de entrega (clave para organización de cocina) |
| `transfer_amount` | NUMERIC | Monto abonado por transferencia |
| `cash_amount` | NUMERIC | Monto abonado en efectivo |
| `total_price` | NUMERIC | Total del pedido |

### `order_items`
| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID PK | |
| `order_id` | UUID FK | Referencia a `orders` (CASCADE DELETE) |
| `product_id` | UUID FK | Nullable (para ajustes manuales) |
| `quantity` | INTEGER | > 0 |
| `unit_price` | NUMERIC | Precio al momento del pedido (snapshot) |
| `discount_amount` | NUMERIC | Descuento fijo calculado en frontend |
| `order_item_status` | ENUM | `pending` → `cooking` → `ready` → `delivered` \| `cancelled` |
| `notes` | TEXT | Ej: "Promo 2x1", "Regalo por demora" |

### `profiles`
| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID PK | Linked a `auth.users` |
| `full_name` | TEXT | |
| `role` | TEXT | Default `staff` |

### RPC Functions
| Función | Descripción |
|---|---|
| `transition_items_to_cooking()` | Pasa ítems `pending` a `cooking` cuando llega la fecha de entrega; sincroniza `orders.order_status` |

---

## Flujo de usuario (Administrador)

```
Login (Supabase Auth)
│
├── Clientes ✅
│   ├── Ver lista (particulares y mayoristas)
│   ├── Crear / Editar cliente (con tax_status)
│   └── Ver historial de pedidos del cliente
│
├── Productos ✅
│   ├── Ver catálogo activo/inactivo
│   ├── Crear / Editar producto (variety, unit/grams, categoría, precios)
│   └── Activar / Desactivar (soft delete)
│
├── Pedidos ✅
│   ├── Ver lista con filtros (estado, fecha, cliente)
│   ├── Crear pedido → seleccionar cliente + ítems + fechas + entrega
│   ├── Editar pedido (productos, cantidades, precios)
│   ├── Avanzar estado: Pendiente → En Cocina → Listo → Entregado
│   ├── Registrar pago (efectivo, transferencia, mixto)
│   ├── Cancelar pedido
│   └── Descargar remito PDF (A4, optimizado para móvil)
│
├── Dashboard Cocina ✅
│   ├── Navegación por fecha (calendario + swipe)
│   ├── Vista agrupada por categoría de productos a producir
│   ├── Estado por ítem (pending → cooking → ready)
│   └── Exportar lista de producción en PDF
│
├── Dashboard Entregas (pendiente)
│   └── Resumen de pedidos del día con datos de cobro
│
└── Control Financiero (pendiente)
    ├── Resumen de ventas por producto / categoría
    └── Historial de transferencias para AFIP
```

---

## Módulos y fases

### Fase 1: MVP — Operaciones Básicas ✅ (completa)

**Objetivo:** que el negocio pueda operar diariamente con el sistema.

- [x] Autenticación (Supabase Auth, login único)
- [x] Gestión de Clientes (CRUD: particulares y mayoristas, con `tax_status`)
- [x] Catálogo de Productos (CRUD con soft delete; esquema `variety` + `unit`/`grams`)
- [x] Gestión de Pedidos (CRUD, estados, ítems con `order_item_status`, pagos mixtos)
- [x] Validaciones de formularios robustas (Zod schemas completos, superRefine para mayoristas)
- [x] Feedback visual consistente (notistack en todas las operaciones + mensajes amigables via getErrorMessage)
- [x] Manejo de errores de red y estados vacíos (isError + Alert con retry + EmptyState en las 3 tablas)
- [x] Suite de tests (Vitest + Testing Library: kitchen utils, useUpdateItemStatus, order cascade)
- [x] Sorting por columnas en las 3 tablas principales (hook `useTableSort` genérico + `TableSortLabel`)
- [x] Filtrado por estado en Pedidos (tabs Activos / Historial / Todos; default oculta entregados/cancelados)
- [x] Navbar responsiva: Drawer móvil con `NAV_ITEMS` como única fuente de verdad

### Fase 2: Dashboards Operativos ⚙️ (parcialmente completa)

**Objetivo:** reducir fricción en las operaciones diarias de cocina y entrega.

- [x] Dashboard Cocina: navegación por fecha (calendario + swipe), vista agrupada por categoría, transiciones de estado por ítem, export PDF
- [x] Bug fix Cocina: query corregida para usar `unit` y `grams` (en vez de columna `presentation` eliminada); `totalQuantity` y chips de estado ahora muestran `quantity × product.unit` (unidades individuales, no bolsas)
- [ ] Dashboard Entregas: lista del día con cliente, dirección, monto a cobrar
- [ ] Filtros avanzados adicionales en Pedidos (por fecha de entrega, tipo de cliente)

### Fase 3: Control Financiero ⚙️ (parcialmente completa)

**Objetivo:** facilitar el trabajo contable mensual y la carga en AFIP.

- [x] Remito por pedido (PDF A4, descarga en móvil, share a WhatsApp)
- [ ] Resumen de ventas por producto y categoría (período seleccionable)
- [ ] Historial de transferencias bancarias agrupado por mes
- [ ] Total facturado por cliente mayorista (para AFIP)
- [ ] Exportación básica de datos (CSV o similar)

### Fase 4: Insumos, procesos y proveedores

**Objetivo:** facilitar el control de insumos.

- [ ] Creación de tablas en BD donde se registren los insumos necesarios por producto.
- [ ] Creación de tablas en BD donde se registren insumos y productos en stock.

---

## Próximos pasos sugeridos

En orden de prioridad operativa para el negocio:

1. **Dashboard Entregas** (Fase 2) — lista del día: cliente, dirección de entrega, monto pendiente de cobro. Vista compacta orientada a repartidor/entregador.
2. **Filtros adicionales en Pedidos** — filtro por fecha de entrega (date picker) y por tipo de cliente (individual/mayorista), combinables con los tabs de estado ya existentes.
3. **Resumen financiero mensual** (Fase 3) — totales por mes, desglose por método de pago (efectivo vs transferencia), para facilitar la carga en AFIP.
4. **Historial de transferencias** (Fase 3) — listado filtrable por mes, exportable, con CUIT del cliente mayorista.

---

## Validación

Antes de avanzar entre fases, verificar:

1. **Fase 1 → Fase 2** ✅: CRUD completo funcional en customers, products y orders. Sin errores de TypeScript. Formularios con validación Zod operativos. Feedback visual en todas las mutaciones.
2. **Fase 2 → Fase 3**: Dashboard Entregas funcional y mostrando datos reales. Las queries de TanStack Query optimizadas (no hay over-fetching).
3. **Cierre Fase 3**: Los reportes financieros coinciden con los datos de `orders` y `order_items`. Revisión con el dueño del negocio antes de considerar el sistema completo.

**Regla general**: cualquier feature nueva que no esté en este plan requiere revisión y actualización de `plan.md` antes de implementarse.
