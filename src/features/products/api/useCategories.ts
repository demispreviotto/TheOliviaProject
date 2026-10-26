// src/features/products/api/useCategories.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../api/supabase';
import type { Category } from './category.types';

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;
      return data as Category[];
    },
  });
};
