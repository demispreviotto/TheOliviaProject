# The Olivia Project - Algo Dulce 🍰

Sistema integral de gestión de ventas, producción y facturación diseñado específicamente para **Algo Dulce**, una pastelería artesanal/mayorista.

## 📌 Descripción del Proyecto

El sistema está enfocado en resolver las necesidades diarias del negocio, facilitando el seguimiento de los procesos clave: desde la toma de pedidos hasta la producción en cocina, empaquetado, entrega y facturación mensual. 

Maneja dos tipos de clientes (Particulares y Mayoristas), con lógicas de precios dinámicos y seguimiento de pagos para facilitar el cálculo de la facturación formal (AFIP).

## 🚀 Tecnologías Utilizadas

Este proyecto es el **Frontend** de la aplicación, desarrollado con una arquitectura moderna y robusta:

- **Framework Core:** [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Lenguaje:** TypeScript
- **UI & Estilos:** [Material UI (MUI v9)](https://mui.com/) + Emotion
- **Gestión del Estado:** 
  - Estado Remoto/Caché: [TanStack React Query (v5)](https://tanstack.com/query/latest)
  - Estado Global: [Zustand](https://zustand-demo.pmnd.rs/)
- **Formularios & Validación:** [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Enrutamiento:** [React Router DOM (v7)](https://reactrouter.com/)
- **Backend as a Service (BaaS):** [Supabase](https://supabase.com/) (Autenticación y Base de Datos)
- **Otras herramientas:** `react-imask` (máscaras de inputs como CUITs o teléfonos), `notistack` (notificaciones).

## 💼 Lógica de Negocio (Core Features)

### 1. Gestión de Clientes (CRM)
- **Particulares:** Nombre, dirección, contacto, medio de adquisición.
- **Mayoristas:** Razón social, CUIT/DNI, dirección de facturación y entrega.

### 2. Catálogo de Productos
- Manejo de precios diferenciados (Minorista y Mayorista).
- Categorización de producción (Budines, Pepas, Cookies, Alfajores, etc.).
- Presentaciones variadas y manejo de estado Activo/Inactivo (Soft delete para no afectar pedidos históricos).

### 3. Sistema de Pedidos (Orders)
- Seguimiento completo de estados: `Pendiente` -> `En Cocina` -> `Listo` -> `Entregado` -> `Cancelado`.
- Tipo de entrega: Retiro (Pickup) o Envío (Delivery).
- Fechas de entrega fundamentales para la organización semanal de cocina.
- Gestión de pagos mixtos (Efectivo y Transferencia) para facilitar el cálculo de facturación mensual (AFIP).

### 4. Dashboards Operativos (En progreso)
- **Cocina:** Visualización rápida de lo que hay que cocinar por día (ej. Lunes/Martes).
- **Empaquetado:** Listas de producción y packaging necesario a preparar.
- **Entregas:** Resumen de pedidos para facilitar la logística y control de cobros contra entrega.

### 5. Control Financiero y Facturación (En progreso)
- Visualización de ventas por productos y categorías.
- Histórico de facturación agrupado por meses.
- Seguimiento de transferencias bancarias de clientes mayoristas para la carga en AFIP el último día del mes.

## 📂 Estructura del Proyecto

El proyecto sigue una arquitectura enfocada en **Features** (Domain-driven), para mantener el código escalable:

```text
src/
 ├── api/           # Lógica de llamadas a Supabase y servicios externos
 ├── assets/        # Imágenes, íconos y archivos estáticos
 ├── components/    # Componentes UI compartidos (Botones, Layouts genéricos)
 ├── features/      # Módulos de la app agrupados por dominio (Customers, Products, Orders)
 ├── layouts/       # Estructuras principales de la UI (Navbars, Sidebars)
 ├── routes/        # Definición de rutas y configuración de navegación
 └── utils/         # Funciones auxiliares, validaciones y formateadores
```

## 🛠️ Instalación y Uso Local

1. Clonar el repositorio.
2. Instalar dependencias utilizando `npm`:
   ```bash
   npm install
   ```
3. Configurar variables de entorno:
   Copiar o crear un archivo `.env.local` en la raíz del proyecto y agregar las credenciales necesarias de Supabase:
   ```env
   VITE_SUPABASE_URL=tu_supabase_url
   VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
   ```
4. Ejecutar entorno de desarrollo:
   ```bash
   npm run dev
   ```

---
*Desarrollado para optimizar el tiempo, organizar la producción y potenciar las finanzas de Algo Dulce.*
