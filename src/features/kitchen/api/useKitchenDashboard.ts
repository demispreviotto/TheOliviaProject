import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../api/supabase';
import { aggregateKitchenData } from '../utils/kitchen.utils';

export const useKitchenDashboard = (date: string) => {
  return useQuery({
    queryKey: ['kitchen-dashboard', date],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          order_status,
          delivery_date,
          customer:customers(full_name, company_name),
          order_items(
            id,
            quantity,
            order_item_status,
            notes,
            products(variety, product_category, presentation)
          )
        `)
        .eq('delivery_date', date)
        .not('order_status', 'in', '("cancelled")')
        .order('created_at');

      if (error) throw error;
      return aggregateKitchenData(data ?? []);
    },
    enabled: !!date,
  });
};
