import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../api/supabase';

export const useKitchenDates = () => {
  return useQuery({
    queryKey: ['kitchen-dates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('delivery_date')
        .not('order_status', 'eq', 'cancelled');

      if (error) throw error;

      const unique = [...new Set((data ?? []).map((r) => r.delivery_date as string))];
      return unique.sort();
    },
  });
};
