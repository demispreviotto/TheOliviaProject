import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../api/supabase';
import type { CreateOrderInput, Order } from './order.types';

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newOrder: CreateOrderInput) => {
      const { order_items, ...orderHeader } = newOrder;

      // 1. Insert Order Header
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([orderHeader])
        .select()
        .single();

      if (orderError) throw orderError;

      const orderId = orderData.id;

      // 2. Insert Order Items with the new order ID
      const itemsToInsert = order_items.map((item) => ({
        ...item,
        order_id: orderId,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(itemsToInsert);

      if (itemsError) {
        // Optional: Delete order header if items fail? 
        // For now, we just throw error as per pattern
        throw itemsError;
      }

      return orderData as Order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};
