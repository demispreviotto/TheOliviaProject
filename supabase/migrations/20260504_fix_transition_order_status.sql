-- supabase/migrations/20260503_fix_transition_order_status.sql
-- Corrige transition_items_to_cooking(): la versión anterior actualizaba los ítems
-- pero no sincronizaba orders.order_status, dejando la orden trabada en 'pending'.
-- Regla: si al menos 1 ítem de la orden está en 'cooking' → orden pasa a 'cooking'.

CREATE OR REPLACE FUNCTION public.transition_items_to_cooking()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- 1. Mover ítems pendientes a 'cooking' para órdenes cuya entrega ya llegó
    UPDATE order_items
    SET order_item_status = 'cooking'
    WHERE order_item_status = 'pending'
      AND order_id IN (
          SELECT id FROM orders
          WHERE delivery_date <= CURRENT_DATE
            AND order_status NOT IN ('cancelled', 'delivered')
      );

    -- 2. Sincronizar orders.order_status a 'cooking' cuando al menos 1 ítem está en cooking
    UPDATE orders
    SET order_status = 'cooking'
    WHERE order_status = 'pending'
      AND id IN (
          SELECT DISTINCT order_id FROM order_items
          WHERE order_item_status = 'cooking'
      );
END;
$$;
