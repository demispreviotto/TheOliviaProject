import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Order, UpdateOrderInput } from "./order.types";
import { supabase } from "../../../api/supabase";

export const useUpdateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderUpdate: UpdateOrderInput) => {
      const { id, order_items, ...orderHeader } = orderUpdate;

      // 1. Update Order Header
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .update(orderHeader)
        .eq('id', id)
        .select()
        .single();

      if (orderError) throw orderError;

      if (order_items) {
        // 2. Delete existing items
        const { error: deleteError } = await supabase
          .from('order_items')
          .delete()
          .eq('order_id', id);

        if (deleteError) throw deleteError;

        const itemsToInsert = order_items.map((item) => {
          const { id: _, ...cleanItem } = item; 
          
          return {
            ...cleanItem,
            order_id: id,
          };
        });

        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(itemsToInsert);

        if (itemsError) throw itemsError;
      }

      // Cascade: if order is set to cooking, all its items must become cooking too
      if (orderHeader.order_status === 'cooking') {
        await supabase
          .from('order_items')
          .update({ order_item_status: 'cooking' })
          .eq('order_id', id)
          .eq('order_item_status', 'pending');
      }

      return orderData as Order;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders', variables.id] });
    },
  });
};