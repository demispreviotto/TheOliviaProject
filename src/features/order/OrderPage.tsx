import { useState } from 'react';
import { CircularProgress, Button, Alert, Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import { OrderTable } from './components/OrderTable';
import { OrderForm } from './components/OrderForm';
import { useOrders } from './api/useOrders';
import { useCreateOrder } from './api/useCreateOrder';
import { useUpdateOrder } from './api/useUpdateOrder';
import { useSnackbar } from 'notistack';
import { getErrorMessage } from '../../utils/errorMessages';

import type { Order } from './api/order.types';
import * as S from '../customers/CustomersPage.styles';

export const OrderPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { data: orders, isLoading, isError, refetch } = useOrders();
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

  const handleCancelForm = () => {
    if (selectedOrder && modalMode === 'edit') {
      setModalMode('view');
    } else {
      handleClose();
    }
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
    } catch (error: unknown) {
      enqueueSnackbar(getErrorMessage(error), { variant: 'error' });
    }
  };

  const renderContent = () => {
    if (isLoading) return <S.LoadingBox><CircularProgress /></S.LoadingBox>;
    if (isError) return (
      <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => refetch()}>Reintentar</Button>}>
        No se pudieron cargar los pedidos. Verificá tu conexión.
      </Alert>
    );
    return (
      <OrderTable
        orders={orders || []}
        onView={(o) => handleAction('view', o)}
      />
    );
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

      {renderContent()}

      <Dialog open={!!modalMode} onClose={handleClose} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {modalMode === 'view' ? 'Resumen de Pedido' : modalMode === 'edit' ? 'Editar Pedido' : 'Nuevo Pedido'}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {modalMode === 'view' && (
              <Button
                size="small"
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => setModalMode('edit')}
              >
                Editar
              </Button>
            )}
            <IconButton onClick={handleClose}><CloseIcon /></IconButton>
          </div>
        </DialogTitle>
        <DialogContent dividers>
          <OrderForm
            key={modalMode ?? 'create'}
            initialData={selectedOrder}
            onSubmit={handleFormSubmit}
            onCancel={handleCancelForm}
            isLoading={createMutation.isPending || updateMutation.isPending}
            isReadOnly={modalMode === 'view'}
          />
        </DialogContent>
      </Dialog>
    </S.PageRoot>
  );
};