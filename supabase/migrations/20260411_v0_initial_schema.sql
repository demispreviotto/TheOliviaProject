-- ##########################################
-- 1. EXTENSIONES (Para generar UUIDs)
-- ##########################################
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ##########################################
-- 2. TABLA: CUSTOMERS (Clientes)
-- ##########################################
-- 1. Tipo ENUM
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'customer_category') THEN
        CREATE TYPE customer_category AS ENUM ('individual', 'wholesale');
    END IF;
END $$;

-- 2. Tabla
CREATE TABLE IF NOT EXISTS customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category customer_category NOT NULL,
  full_name TEXT NOT NULL,
  company_name TEXT,
  tax_id TEXT,
  phone TEXT,
  email TEXT,
  delivery_address TEXT,
  billing_address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ##########################################
-- 3. TABLA: PRODUCTS (Productos)
-- ##########################################
-- 1. Definición del Tipo ENUM
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'product_type_enum') THEN
        CREATE TYPE product_type_enum AS ENUM (
            'pepas', 
            'budin', 
            'cookies', 
            'alfajores', 
            'pan', 
            'talitas', 
            'torta'
        );
    END IF;
END $$;

-- 2. Creación de la Tabla con nombres limpios
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_name TEXT NOT NULL,
  product_category product_type_enum NOT NULL,
  presentation TEXT,       
  wholesale_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  retail_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ##########################################
-- 4. TABLA: ORDERS (Cabecera de Pedidos)
-- ##########################################
-- 1. Definición del Tipo ENUM
DO $$ 
BEGIN
    -- Tipo para el estado del pedido
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status_enum') THEN
        CREATE TYPE order_status_enum AS ENUM ('pending', 'cooking', 'ready', 'delivered', 'cancelled');
    END IF;

    -- Tipo para la forma de entrega
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'delivery_type_enum') THEN
        CREATE TYPE delivery_type_enum AS ENUM ('pickup', 'delivery');
    END IF;

    -- Tipo para el estado del pago
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status_enum') THEN
        CREATE TYPE payment_status_enum AS ENUM ('pending', 'partially_paid', 'paid');
    END IF;

    -- Tipo para el método de pago
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method_enum') THEN
        CREATE TYPE payment_method_enum AS ENUM ('cash', 'transfer', 'mixed');
    END IF;
END $$;

-- 2. Creación de la Tabla con nombres limpios
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) NOT NULL,

  order_status order_status_enum DEFAULT 'pending',
  delivery_mode delivery_type_enum NOT NULL,
  payment_state payment_status_enum DEFAULT 'pending',
  pay_method payment_method_enum,
  
  delivery_date DATE NOT NULL,
  transfer_amount NUMERIC(10, 2) DEFAULT 0,
  cash_amount NUMERIC(10, 2) DEFAULT 0,
  total_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ##########################################
-- 5. TABLA: ORDER_ITEMS (Detalle de Pedidos)
-- ##########################################
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id), -- Nullable para descuentos manuales
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10, 2) NOT NULL,       -- Precio del producto en ese momento
  discount_amount NUMERIC(10, 2) DEFAULT 0, -- Monto fijo a restar del subtotal (calculado por Front)
  notes TEXT,                               -- Ej: 'Promo 2x1', 'Regalo por demora'
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ##########################################
-- 6. SEGURIDAD (Row Level Security - RLS)
-- ##########################################
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (Permitir todo a usuarios autenticados por ahora)
CREATE POLICY "Allow all for auth users" ON customers FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for auth users" ON products FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for auth users" ON orders FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for auth users" ON order_items FOR ALL TO authenticated USING (true);

-- ##########################################
-- 7. ACTUALIZACIÓN AUTOMÁTICA DE 'updated_at'
-- ##########################################
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';


CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_order_items_updated_at BEFORE UPDATE ON order_items FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column(); 