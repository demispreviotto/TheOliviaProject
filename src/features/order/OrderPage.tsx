import { useState } from 'react';
import { CircularProgress, Button, Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { OrderTable } from './components/OrderTable';
import { OrderForm } from './components/OrderForm';
import { useOrders } from './api/useOrders';
import { useCreateOrder } from './api/useCreateOrder';
import { useUpdateOrder } from './api/useUpdateOrder';
import { useSnackbar } from 'notistack';

import type { Order } from './api/order.types';
import * as S from '../customers/CustomersPage.styles';

export const OrderPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { data: orders, isLoading } = useOrders();
  const createMutation = useCreateOrder();
  const updateMutation = useUpdateOrder();

  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view' | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const handleAction = (mode: 'create' | 'edit' | 'view', order?: Order) => {
    setSelectedOrder(order || null);
    setModalMode(mode);
  };

  const handleClose = () => {
    setModalMode(null);
    setSelectedOrder(null);
  };

  const handleFormSubmit = async (data: any) => {
    try {
      if (selectedOrder) {
        await updateMutation.mutateAsync({ id: selectedOrder.id, ...data });
        enqueueSnackbar('Pedido actualizado', { variant: 'success' });
      } else {
        await createMutation.mutateAsync(data);
        enqueueSnackbar('Pedido creado', { variant: 'success' });
      }
      handleClose();
    } catch (error: any) {
      enqueueSnackbar(`Error: ${error.message}`, { variant: 'error' });
    }
  };

  return (
    <S.PageRoot>
      <S.PageHeader direction="row">
        <S.PageTitle variant="h4">Pedidos</S.PageTitle>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={() => handleAction('create')}
        >
          Nuevo Pedido
        </Button>
      </S.PageHeader>

      {isLoading ? (
        <S.LoadingBox><CircularProgress /></S.LoadingBox>
      ) : (
        <OrderTable 
          orders={orders || []} 
          onEdit={(o) => handleAction('edit', o)}
          onView={(o) => handleAction('view', o)}
        />
      )}

      <Dialog open={!!modalMode} onClose={handleClose} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {modalMode === 'view' ? 'Resumen de Pedido' : modalMode === 'edit' ? 'Editar Pedido' : 'Nuevo Pedido'}
          <IconButton onClick={handleClose}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <OrderForm 
            initialData={selectedOrder}
            onSubmit={handleFormSubmit}
            onCancel={handleClose}
            isLoading={createMutation.isPending || updateMutation.isPending}
            isReadOnly={modalMode === 'view'}
          />
        </DialogContent>
      </Dialog>
    </S.PageRoot>
  );
};