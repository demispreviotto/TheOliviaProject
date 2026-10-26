-- supabase/migrations/20261026_add_categories_table.sql
-- Reemplaza el ENUM product_type_enum por una tabla `categories`, para que el
-- usuario pueda crear nuevas categorías desde la app sin requerir una migración.

-- ##########################################
-- 1. TABLA: CATEGORIES
-- ##########################################
-- El id es el texto mostrado tal cual (ej: 'budin_integral', o 'Medialunas'
-- si se crea desde la UI). Sin columna de label separada: minimiza el cambio
-- necesario en el resto de la app, que ya hace `label ?? id` como fallback.
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for auth users" ON categories
    FOR ALL TO authenticated USING (true);

GRANT ALL ON categories TO authenticated;

-- Semilla: una fila por cada valor existente del enum
INSERT INTO categories (id)
SELECT unnest(enum_range(NULL::product_type_enum))::text
ON CONFLICT (id) DO NOTHING;

-- ##########################################
-- 2. MIGRAR products.product_category A TEXT + FK
-- ##########################################
ALTER TABLE products
    ALTER COLUMN product_category TYPE TEXT
    USING product_category::text;

ALTER TABLE products
    ADD CONSTRAINT products_product_category_fkey
    FOREIGN KEY (product_category) REFERENCES categories(id);

-- Índice para la FK (lookups y joins por categoría)
CREATE INDEX IF NOT EXISTS products_product_category_idx ON products (product_category);

DROP TYPE product_type_enum;
