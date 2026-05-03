// src/features/products/api/useProducts.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../api/supabase';
import type { Product } from './product.types';

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('variety', { ascending: true });

      if (error) throw error;
      return data as Product[];
    },
  });
};