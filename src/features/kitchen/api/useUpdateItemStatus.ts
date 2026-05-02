import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../api/supabase';
import type { OrderItemStatus } from '../../order/api/order.types';

interface UpdateItemStatusArgs {
  itemIds: string[];
  newStatus: OrderItemStatus;
  orderId: string;
  date: string;
}

export const useUpdateItemStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ itemIds, newStatus, orderId }: UpdateItemStatusArgs) => {
      const { error: itemError } = await supabase
        .from('order_items')
        .update({ order_item_status: newStatus })
        .in('id', itemIds);

      if (itemError) throw itemError;

      // Sync order_status: fetch all items for this order and recalculate
      const { data: allItems, error: fetchError } = await supabase
        .from('order_items')
        .select('order_item_status')
        .eq('order_id', orderId);

      if (fetchError) throw fetchError;

      const statuses = (allItems ?? []).map((i) => i.order_item_status as OrderItemStatus);
      const anyCooking = statuses.some((s) => s === 'cooking');
      const anyPendingOrCooking = statuses.some((s) => s === 'pending' || s === 'cooking');

      // Only update order_status if it makes sense (don't touch delivered/cancelled orders)
      if (anyCooking || anyPendingOrCooking) {
        const newOrderStatus = anyCooking ? 'cooking' : 'pending';
        await supabase
          .from('orders')
          .update({ order_status: newOrderStatus })
          .eq('id', orderId)
          .not('order_status', 'in', '("delivered","cancelled")');
      }
    },
    onSuccess: (_, { date }) => {
      queryClient.invalidateQueries({ queryKey: ['kitchen-dashboard', date] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};
