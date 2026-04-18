import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../api/supabase';
import type { UpdateOrderInput, Order } from './order.types';

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

        // 3. Insert new items
        const itemsToInsert = order_items.map((item) => ({
          ...item,
          order_id: id,
          // Remove ID if present to let Supabase generate new ones (since we deleted all)
          id: undefined, 
        }));

        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(itemsToInsert);

        if (itemsError) throw itemsError;
      }

      return orderData as Order;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders', variables.id] });
    },
  });
};
