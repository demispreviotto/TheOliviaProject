import { useState } from 'react';
import { CircularProgress, Button, Alert, Dialog, DialogTitle, DialogContent, IconButton, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import PrintIcon from '@mui/icons-material/Print';
import ShareIcon from '@mui/icons-material/Share';
import { OrderTable } from './components/OrderTable';
import { OrderForm } from './components/OrderForm';
import { OrderRemito, getRemitoElementId } from './components/OrderRemito';
import { generateRemitoPdf } from './utils/generateRemitoPdf';
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
  const [isSharing, setIsSharing] = useState(false);

  const canSharePdf = (): boolean => {
    if (!navigator.canShare) return false;
    try {
      return navigator.canShare({ files: [new File([''], 'test.pdf', { type: 'application/pdf' })] });
    } catch {
      return false;
    }
  };

  const handleShare = async () => {
    if (!selectedOrder) return;
    setIsSharing(true);
    try {
      const file = await generateRemitoPdf(getRemitoElementId(selectedOrder.id), selectedOrder.id);
      await navigator.share({
        files: [file],
        title: 'Remito de Pedido',
        text: 'Adjuntamos el remito digital de su pedido.',
      });
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        enqueueSnackbar('No se pudo compartir el remito.', { variant: 'error' });
      }
    } finally {
      setIsSharing(false);
    }
  };

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

      {modalMode === 'view' && selectedOrder && (
        <OrderRemito order={selectedOrder} />
      )}

      <Dialog open={!!modalMode} onClose={handleClose} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {modalMode === 'view' ? 'Resumen de Pedido' : modalMode === 'edit' ? 'Editar Pedido' : 'Nuevo Pedido'}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {modalMode === 'view' && (
              <>
                <Tooltip title={canSharePdf() ? '' : 'Compartir nativo no disponible en este navegador'}>
                  <span>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={isSharing ? <CircularProgress size={14} /> : <ShareIcon />}
                      onClick={handleShare}
                      disabled={!canSharePdf() || isSharing}
                    >
                      {isSharing ? 'Generando PDF...' : 'Compartir'}
                    </Button>
                  </span>
                </Tooltip>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<PrintIcon />}
                  onClick={() => window.print()}
                >
                  Imprimir Remito
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => setModalMode('edit')}
                >
                  Editar
                </Button>
              </>
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