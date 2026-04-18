import { useState } from 'react';
import { Box, Typography, Button, Stack, CircularProgress } from '@mui/material';
import { OrderForm } from './components/OrderForm';
import { useCreateOrder } from './api/useCreateOrder';
import { useUpdateOrder } from './api/useUpdateOrder';
import { useSnackbar } from 'notistack';
import { supabase } from '../../api/supabase';
import type { Order } from './api/order.types';

export const OrderPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const createMutation = useCreateOrder();
  const updateMutation = useUpdateOrder();
  
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [isFetchingOrder, setIsFetchingOrder] = useState(false);

  const handleFormSubmit = async (data: any) => {
    try {
      if (editingOrder) {
        await updateMutation.mutateAsync({ id: editingOrder.id, ...data });
        enqueueSnackbar('Pedido actualizado correctamente', { variant: 'success' });
      } else {
        await createMutation.mutateAsync(data);
        enqueueSnackbar('Pedido creado correctamente', { variant: 'success' });
      }
      setEditingOrder(null);
    } catch (error: any) {
      enqueueSnackbar(`Error: ${error.message}`, { variant: 'error' });
    }
  };

  const loadTestData = async (id: string) => {
    setIsFetchingOrder(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      setEditingOrder(data as Order);
      enqueueSnackbar('Pedido cargado para edición', { variant: 'info' });
    } catch (error: any) {
      enqueueSnackbar(`Error cargando pedido: ${error.message}`, { variant: 'error' });
    } finally {
      setIsFetchingOrder(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">Gestión de Pedidos</Typography>
        <Stack direction="row" spacing={1}>
          {editingOrder && (
            <Button variant="text" onClick={() => setEditingOrder(null)}>
              Cancelar Edición
            </Button>
          )}
        </Stack>
      </Stack>

      {isFetchingOrder ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      ) : (
        <OrderForm 
          initialData={editingOrder} 
          onSubmit={handleFormSubmit}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      )}

      
      {/* Botones de debug para facilitar al usuario cargar datos si ya tiene IDs */}
      <Box sx={{ mt: 5, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
        <Typography variant="caption" display="block" gutterBottom>Debug: Cargar pedido por ID</Typography>
        <Button size="small" variant="outlined" onClick={() => {
          const id = prompt('Ingrese UUID del pedido:');
          if (id) loadTestData(id);
        }}>
          Cargar pedido específico
        </Button>
      </Box>
    </Box>
  );
};
