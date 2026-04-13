import { useState } from 'react';
import { Box, Typography, Button, Stack, CircularProgress } from '@mui/material';
import { CustomerForm } from './components/CustomerForm';
import { useCreateCustomer } from './api/useCreateCustomer';
import { useUpdateCustomer } from './api/useUpdateCustomer';
import { useSnackbar } from 'notistack';
import { supabase } from '../../api/supabase';
import type { Customer } from './api/customer.types';

export const CustomersPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();
  
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isFetchingCustomer, setIsFetchingCustomer] = useState(false);

  const handleFormSubmit = async (data: any) => {
    try {
      if (editingCustomer) {
        await updateMutation.mutateAsync({ id: editingCustomer.id, ...data });
        enqueueSnackbar('Cliente actualizado correctamente', { variant: 'success' });
      } else {
        await createMutation.mutateAsync(data);
        enqueueSnackbar('Cliente guardado correctamente', { variant: 'success' });
      }
      setEditingCustomer(null);
    } catch (error: any) {
      enqueueSnackbar(`Error: ${error.message}`, { variant: 'error' });
    }
  };

  const loadTestData = async (id: string) => {
    setIsFetchingCustomer(true);
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      setEditingCustomer(data as Customer);
      enqueueSnackbar('Datos de prueba cargados', { variant: 'info' });
    } catch (error: any) {
      enqueueSnackbar(`Error cargando datos: ${error.message}`, { variant: 'error' });
    } finally {
      setIsFetchingCustomer(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">Gestión de Clientes</Typography>
        <Stack direction="row" spacing={1}>
          <Button 
            variant="outlined" 
            size="small"
            onClick={() => loadTestData('a1111111-1111-1111-1111-111111111111')}
            disabled={isFetchingCustomer}
          >
            Editar Juan Pérez (Seed)
          </Button>
          <Button 
            variant="outlined" 
            size="small"
            onClick={() => loadTestData('b2222222-2222-2222-2222-222222222222')}
            disabled={isFetchingCustomer}
          >
            Editar Café Central (Seed)
          </Button>
          {editingCustomer && (
            <Button variant="text" onClick={() => setEditingCustomer(null)}>
              Cancelar Edición
            </Button>
          )}
        </Stack>
      </Stack>

      {isFetchingCustomer ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      ) : (
        <CustomerForm 
          initialData={editingCustomer} 
          onSubmit={handleFormSubmit}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      )}
    </Box>
  );
};
