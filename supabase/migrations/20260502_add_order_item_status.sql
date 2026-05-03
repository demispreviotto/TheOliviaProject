-- supabase/migrations/20260502_add_order_item_status.sql
-- Compatible con entorno local Docker y producción.
-- NOTA: el job pg_cron para producción está en supabase/pg_cron_production.sql
--       y se ejecuta manualmente una sola vez desde el Dashboard de Supabase.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Nuevo ENUM para el estado de cada ítem de pedido
-- ─────────────────────────────────────────────────────────────────────────────
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

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Agregar columna a order_items
--    DEFAULT 'pending' se aplica a todos los registros existentes.
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE order_items
    ADD COLUMN IF NOT EXISTS order_item_status order_item_status_enum NOT NULL DEFAULT 'pending';

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Función RPC: transition_items_to_cooking()
--    Mueve a 'cooking' todos los ítems 'pending' cuya orden de entrega
--    ya llegó (delivery_date <= hoy).
--
--    Uso dual:
--      a) El frontend la llama al abrir el Dashboard de Cocina (funciona en local y producción).
--      b) En producción, el job pg_cron la llama automáticamente a las 00:00 ART.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.transition_items_to_cooking()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
    UPDATE order_items
    SET order_item_status = 'cooking'
    WHERE order_item_status = 'pending'
      AND order_id IN (
          SELECT id FROM orders
          WHERE delivery_date <= CURRENT_DATE
            AND order_status NOT IN ('cancelled', 'delivered')
      );
$$;
