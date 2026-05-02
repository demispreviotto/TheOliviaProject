-- supabase/migrations/20260502_add_order_item_status.sql

-- 1. Nuevo ENUM para el estado de cada ítem de pedido
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_item_status_enum') THEN
        CREATE TYPE order_item_status_enum AS ENUM (
            'pending',
            'cooking',
            'ready',
            'delivered',
            'cancelled'
        );
    END IF;
END $$;

-- 2. Agregar columna a order_items (DEFAULT 'pending' para todos los registros existentes)
ALTER TABLE order_items
    ADD COLUMN IF NOT EXISTS order_item_status order_item_status_enum NOT NULL DEFAULT 'pending';

-- 3. pg_cron: transición automática pending → cooking a las 00:00 UTC-5 (= 05:00 UTC)
CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule(
    'auto-cooking-transition',
    '0 5 * * *',
    $$
        UPDATE order_items
        SET order_item_status = 'cooking'
        WHERE order_item_status = 'pending'
          AND order_id IN (
              SELECT id FROM orders
              WHERE delivery_date <= CURRENT_DATE
                AND order_status NOT IN ('cancelled', 'delivered')
          );
    $$
);
