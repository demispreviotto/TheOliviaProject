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
| `product_name` | TEXT | |
| `product_category` | ENUM | `pepas`, `budin`, `cookies`, `alfajores`, `pan`, `talitas`, `torta` |
| `presentation` | TEXT | Ej: "x6", "x12", "caja grande" |
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
| `notes` | TEXT | Ej: "Promo 2x1", "Regalo por demora" |

### `profiles`
| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID PK | Linked a `auth.users` |
| `full_name` | TEXT | |
| `role` | TEXT | Default `staff` |

---

## Flujo de usuario (Administrador)

```
Login (Supabase Auth)
│
├── Clientes
│   ├── Ver lista (particulares y mayoristas)
│   ├── Crear / Editar cliente
│   └── Ver historial de pedidos del cliente
│
├── Productos
│   ├── Ver catálogo activo/inactivo
│   ├── Crear / Editar producto (precios y categoría)
│   └── Activar / Desactivar (soft delete)
│
├── Pedidos
│   ├── Ver lista con filtros (estado, fecha, cliente)
│   ├── Crear pedido → seleccionar cliente + ítems + fechas + entrega
│   ├── Editar pedido (productos, cantidades, precios)
│   ├── Avanzar estado: Pendiente → En Cocina → Listo → Entregado
│   ├── Registrar pago (efectivo, transferencia, mixto)
│   └── Cancelar pedido
│
├── Dashboard Cocina (en progreso)
│   └── Vista por día de lo que hay que producir
│
├── Dashboard Entregas (en progreso)
│   └── Resumen de pedidos del día con datos de cobro
│
└── Control Financiero (en progreso)
    ├── Ventas por producto / categoría
    └── Historial de transferencias para AFIP
```

---

## Módulos y fases

### Fase 1: MVP — Operaciones Básicas ✅ (en curso)

**Objetivo:** que el negocio pueda operar diariamente con el sistema.

- [x] Autenticación (Supabase Auth, login único)
- [x] Gestión de Clientes (CRUD: particulares y mayoristas)
- [x] Catálogo de Productos (CRUD con soft delete)
- [x] Gestión de Pedidos (CRUD, estados, ítems, pagos mixtos)
- [ ] Validaciones de formularios robustas (Zod schemas completos)
- [ ] Feedback visual consistente (notistack en todas las operaciones)
- [ ] Manejo de errores de red y estados vacíos

### Fase 2: Dashboards Operativos

**Objetivo:** reducir fricción en las operaciones diarias de cocina y entrega.

- [ ] Dashboard Cocina: vista por día/semana de productos a producir (agrupado por categoría)
- [ ] Dashboard Entregas: lista del día con cliente, dirección, monto a cobrar
- [ ] Dashboard Empaquetado: listas de producción y packaging
- [ ] Filtros avanzados en Pedidos (por fecha de entrega, estado, tipo de cliente)

### Fase 3: Control Financiero

**Objetivo:** facilitar el trabajo contable mensual y la carga en AFIP.

- [ ] Creacion de un albaran por pedido para clientes mayoristas, exportable en PDF con funcionalidad para compartir a Whatsapp.
- [ ] Resumen de ventas por producto y categoría (período seleccionable)
- [ ] Historial de transferencias bancarias agrupado por mes
- [ ] Total facturado por cliente mayorista (para AFIP)
- [ ] Exportación básica de datos (CSV o similar)

### Fase 4: Insumos, procesos y proveedores.

**Objetivo:** facilitar el control de insumos.

- [ ] Creacion de tablas en BD donde se registren los insumos necesarios por producto.
- [ ] Creacion de tablas en BD donde se registren insumos y productos en stock.

---

## Validación

Antes de avanzar entre fases, verificar:

1. **Fase 1 → Fase 2**: CRUD completo funcional en customers, products y orders. Sin errores de TypeScript. Formularios con validación Zod operativos. Feedback visual en todas las mutaciones.
2. **Fase 2 → Fase 3**: Los tres dashboards operativos están funcionales y muestran datos reales. Las queries de TanStack Query están optimizadas (no hay over-fetching).
3. **Cierre Fase 3**: Los reportes financieros coinciden con los datos de `orders` y `order_items`. Revisión con el dueño del negocio antes de considerar el sistema completo.

**Regla general**: cualquier feature nueva que no esté en este plan requiere revisión y actualización de `plan.md` antes de implementarse.
