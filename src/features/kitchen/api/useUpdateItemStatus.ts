import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../api/supabase';
import type { OrderItemStatus } from '../../order/api/order.types';
import { calculateNewOrderStatus } from '../utils/kitchen.business';

interface UpdateItemStatusArgs {
  itemIds: string[];
  newStatus: OrderItemStatus;
  orderIds: string[];
  date: string;
}

const syncOrderStatus = async (orderId: string) => {
  const { data: allItems, error } = await supabase
    .from('order_items')
    .select('order_item_status')
    .eq('order_id', orderId);

  if (error) throw error;

  const statuses = (allItems ?? []).map((i) => i.order_item_status as OrderItemStatus);
  const newOrderStatus = calculateNewOrderStatus(statuses);

  if (newOrderStatus === 'ready') {
    await supabase
      .from('orders')
      .update({ order_status: 'ready' })
      .eq('id', orderId)
      .not('order_status', 'in', '("delivered","cancelled")');
  } else if (newOrderStatus === 'cooking') {
    await supabase
      .from('orders')
      .update({ order_status: 'cooking' })
      .eq('id', orderId)
      .not('order_status', 'in', '("delivered","cancelled","ready")');
  }
};

export const useUpdateItemStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ itemIds, newStatus, orderIds }: UpdateItemStatusArgs) => {
      const { error } = await supabase
        .from('order_items')
        .update({ order_item_status: newStatus })
        .in('id', itemIds);

      if (error) throw error;

      await Promise.all(orderIds.map(syncOrderStatus));
    },
    onSuccess: (_, { date }) => {
      queryClient.invalidateQueries({ queryKey: ['kitchen-dashboard', date] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};
