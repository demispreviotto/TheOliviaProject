import { useState, useEffect, useMemo } from 'react';
import {
  CircularProgress, Button, Alert, Dialog, DialogTitle, DialogContent,
  IconButton, Tooltip, Box, Tabs, Tab,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
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
import type { Order, OrderStatus } from './api/order.types';
import * as S from './OrderPage.styles';

type FilterView = 'active' | 'history' | 'all';

const ACTIVE_STATUSES: OrderStatus[]  = ['pending', 'cooking', 'ready'];
const HISTORY_STATUSES: OrderStatus[] = ['delivered', 'cancelled'];

export const OrderPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { data: orders, isLoading, isError, refetch } = useOrders();
  const createMutation = useCreateOrder();
  const updateMutation = useUpdateOrder();

  const [filterView, setFilterView]   = useState<FilterView>('active');
  const [modalMode, setModalMode]     = useState<'create' | 'edit' | 'view' | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [remitoFile, setRemitoFile]   = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const shareSupported = useMemo(() => {
    if (!navigator.canShare) return false;
    try {
      return navigator.canShare({ files: [new File([''], 'test.pdf', { type: 'application/pdf' })] });
    } catch {
      return false;
    }
  }, []);

  // Counts for tab labels — computed from unfiltered list
  const counts = useMemo(() => {
    if (!orders) return { active: 0, history: 0, all: 0 };
    return {
      active:  orders.filter((o) => ACTIVE_STATUSES.includes(o.order_status)).length,
      history: orders.filter((o) => HISTORY_STATUSES.includes(o.order_status)).length,
      all:     orders.length,
    };
  }, [orders]);

  // Main filter — applied before the table's own sort
  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    switch (filterView) {
      case 'active':  return orders.filter((o) => ACTIVE_STATUSES.includes(o.order_status));
      case 'history': return orders.filter((o) => HISTORY_STATUSES.includes(o.order_status));
      case 'all':     return orders;
    }
  }, [orders, filterView]);

  // Pre-generate the PDF as soon as the view modal renders the Remito element.
  // The 300 ms delay gives React time to mount and paint the hidden element before
  // html2canvas tries to measure it.
  useEffect(() => {
    if (modalMode !== 'view' || !selectedOrder || !shareSupported) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      setIsGenerating(true);
      try {
        const file = await generateRemitoPdf(getRemitoElementId(selectedOrder.id), selectedOrder.id);
        if (!cancelled) setRemitoFile(file);
      } catch {
        // Non-critical — share button stays disabled if generation fails
      } finally {
        if (!cancelled) setIsGenerating(false);
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [modalMode, selectedOrder, shareSupported]);

  // navigator.share() MUST be called synchronously within the tap-event task.
  // No await before it — the pre-generated file is already in state.
  const handleShare = () => {
    if (!remitoFile) return;
    navigator.share({
      files: [remitoFile],
      title: 'Remito de Pedido',
      text: 'Adjuntamos el remito digital de su pedido.',
    }).catch((err: unknown) => {
      if (err instanceof Error && err.name !== 'AbortError') {
        enqueueSnackbar('No se pudo compartir el remito.', { variant: 'error' });
      }
    });
  };

  const handleAction = (mode: 'create' | 'edit' | 'view', order?: Order) => {
    setSelectedOrder(order || null);
    setModalMode(mode);
  };

  const handleClose = () => {
    setModalMode(null);
    setSelectedOrder(null);
    setRemitoFile(null);
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

  const tabLabel = (label: string, count: number) =>
    orders ? `${label} (${count})` : label;

  const renderContent = () => {
    if (isLoading) return <S.LoadingBox><CircularProgress /></S.LoadingBox>;
    if (isError) return (
      <Alert
        severity="error"
        action={<Button color="inherit" size="small" onClick={() => refetch()}>Reintentar</Button>}
      >
        No se pudieron cargar los pedidos. Verificá tu conexión.
      </Alert>
    );
    return (
      <OrderTable
        orders={filteredOrders}
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

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs
          value={filterView}
          onChange={(_, v: FilterView) => setFilterView(v)}
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab label={tabLabel('Activos', counts.active)}   value="active"  />
          <Tab label={tabLabel('Historial', counts.history)} value="history" />
          <Tab label={tabLabel('Todos', counts.all)}         value="all"     />
        </Tabs>
      </Box>

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
                <Tooltip title={!shareSupported ? 'Compartir nativo no disponible en este navegador' : ''}>
                  <span>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={isGenerating ? <CircularProgress size={14} /> : <ShareIcon />}
                      onClick={handleShare}
                      disabled={!shareSupported || !remitoFile || isGenerating}
                    >
                      {isGenerating ? 'Preparando...' : 'Compartir'}
                    </Button>
                  </span>
                </Tooltip>
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
