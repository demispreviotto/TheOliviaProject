-- supabase/migrations/20260503_refactor_products_table.sql
-- Refactorización de la tabla products:
--   - Reemplazo del ENUM product_type_enum (snake_case, elimina 'budin')
--   - Renombre de columna product_name → variety
--   - Nuevas columnas unit (NOT NULL, default 1) y grams (NULLABLE)

-- ##########################################
-- 1. REEMPLAZAR ENUM product_type_enum
-- ##########################################

-- Nuevo tipo con valores finales en snake_case
CREATE TYPE product_type_enum_v2 AS ENUM (
    'budin_integral',
    'budin_avena',
    'pepas',
    'cookies',
    'cookies_xl',
    'galletitas',
    'alfajores',
    'pan',
    'talitas',
    'galleta_marinera',
    'torta'
);

-- Migrar la columna: 'budin' existente → 'budin_integral'; resto sin cambio
ALTER TABLE products
    ALTER COLUMN product_category TYPE product_type_enum_v2
    USING (
        CASE product_category::text
            WHEN 'budin' THEN 'budin_integral'
            ELSE product_category::text
        END
    )::product_type_enum_v2;

DROP TYPE product_type_enum;
ALTER TYPE product_type_enum_v2 RENAME TO product_type_enum;

-- ##########################################
-- 2. RENOMBRE DE COLUMNA
-- ##########################################
ALTER TABLE products RENAME COLUMN product_name TO variety;

-- ##########################################
-- 3. NUEVAS COLUMNAS DE PRESENTACIÓN
-- ##########################################
-- unit: cantidad de unidades por presentación (NOT NULL, default 1)
-- grams: peso total de la presentación en gramos (opcional)
ALTER TABLE products
    ADD COLUMN unit NUMERIC NOT NULL DEFAULT 1,
    ADD COLUMN grams NUMERIC;
