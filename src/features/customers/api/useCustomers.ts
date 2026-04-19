import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../api/supabase';
import type { Customer } from './customer.types';

export const useCustomers = () => {
  return useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('full_name', { ascending: true });

      if (error) throw error;
      return data as Customer[];
    },
  });
};