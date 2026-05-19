import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../api/supabase';
import type { CreateCustomerInput, Customer } from './customer.types';

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newCustomer: CreateCustomerInput) => {
      const { data, error } = await supabase
        .from('customers')
        .insert([newCustomer])
        .select()
        .single();

      if (error) throw error;
      return data as Customer;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
};
