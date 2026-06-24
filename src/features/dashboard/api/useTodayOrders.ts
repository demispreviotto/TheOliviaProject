import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../api/supabase';
import type { Order } from '../../order/api/order.types';

const today = () => new Date().toISOString().slice(0, 10);

export const useTodayOrders = () =>
  useQuery({
    queryKey: ['today-orders', today()],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id, order_status, delivery_mode, total_price, delivery_date,
          customer:customers(full_name, company_name)
        `)
        .eq('delivery_date', today())
        .not('order_status', 'in', '("cancelled")')
        .order('created_at');
      if (error) throw error;
      return (data ?? []) as unknown as Order[];
    },
  });
