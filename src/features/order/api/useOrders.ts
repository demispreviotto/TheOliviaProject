import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../api/supabase';

export const useOrders = () => {
  return useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          customer:customers(*),
          order_items(*, products(*))
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};