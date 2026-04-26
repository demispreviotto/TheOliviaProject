import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../api/supabase';

export const useCustomerHistory = (customerId: string | null) => {
  return useQuery({
    queryKey: ['customer-history', customerId],
    queryFn: async () => {
      if (!customerId) return null;
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*, products(*))')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // Ignore "not found"
      return data;
    },
    enabled: !!customerId,
  });
};