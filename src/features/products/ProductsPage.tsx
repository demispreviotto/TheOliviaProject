import { useState } from 'react';
import { Box, Typography, Button, Stack, CircularProgress } from '@mui/material';
import { ProductForm } from './components/ProductForm';
import { useCreateProduct } from './api/useCreateProduct';
import { useUpdateProduct } from './api/useUpdateProduct';
import { useSnackbar } from 'notistack';
import { supabase } from '../../api/supabase';
import type { Product } from './api/product.types';

export const ProductsPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isFetchingProduct, setIsFetchingProduct] = useState(false);

  const handleFormSubmit = async (data: any) => {
    try {
      if (editingProduct) {
        await updateMutation.mutateAsync({ id: editingProduct.id, ...data });
        enqueueSnackbar('Producto actualizado correctamente', { variant: 'success' });
      } else {
        await createMutation.mutateAsync(data);
        enqueueSnackbar('Producto guardado correctamente', { variant: 'success' });
      }
      setEditingProduct(null);
    } catch (error: any) {
      enqueueSnackbar(`Error: ${error.message}`, { variant: 'error' });
    }
  };

  const loadTestData = async (id: string) => {
    setIsFetchingProduct(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      setEditingProduct(data as Product);
      enqueueSnackbar('Datos de prueba cargados', { variant: 'info' });
    } catch (error: any) {
      enqueueSnackbar(`Error cargando datos: ${error.message}`, { variant: 'error' });
    } finally {
      setIsFetchingProduct(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">Gestión de Productos</Typography>
        <Stack direction="row" spacing={1}>
          <Button 
            variant="outlined" 
            size="small"
            onClick={() => loadTestData('c3333333-3333-3333-3333-333333333333')}
            disabled={isFetchingProduct}
          >
            Editar Budín (Seed)
          </Button>
          <Button 
            variant="outlined" 
            size="small"
            onClick={() => loadTestData('d4444444-4444-4444-4444-444444444444')}
            disabled={isFetchingProduct}
          >
            Editar Pepas (Seed)
          </Button>
          {editingProduct && (
            <Button variant="text" onClick={() => setEditingProduct(null)}>
              Cancelar Edición
            </Button>
          )}
        </Stack>
      </Stack>

      {isFetchingProduct ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      ) : (
        <ProductForm 
          initialData={editingProduct} 
          onSubmit={handleFormSubmit}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      )}
    </Box>
  );
};
