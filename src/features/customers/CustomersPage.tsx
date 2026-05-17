// src/features/customers/CustomersPage.tsx
import { useState } from 'react';
import {
  Button, CircularProgress, Alert,
  Dialog, DialogContent, DialogTitle, IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import { CustomerForm } from './components/CustomerForm';
import { CustomerTable } from './components/CustomerTable';
import { useCustomers } from './api/useCustomers';
import { useCreateCustomer } from './api/useCreateCustomer';
import { useUpdateCustomer } from './api/useUpdateCustomer';
import { useSnackbar } from 'notistack';
import { getErrorMessage } from '../../utils/errorMessages';
import type { Customer } from './api/customer.types';
import * as S from './CustomersPage.styles'

export const CustomersPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { data: customers, isLoading: isTableLoading, isError, refetch } = useCustomers();
  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view' | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const handleAction = (mode: 'create' | 'edit' | 'view', customer?: Customer) => {
    setSelectedCustomer(customer || null);
    setModalMode(mode);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setModalMode(null);
    setSelectedCustomer(null);
  };

  const handleCancelForm = () => {
    if (selectedCustomer && modalMode === 'edit') {
      setModalMode('view');
    } else {
      handleClose();
    }
  };

  const getTitle = () => {
    if (modalMode === 'view') return 'Detalles del Cliente';
    if (modalMode === 'edit') return 'Editar Cliente';
    return 'Nuevo Cliente';
  };

  const handleFormSubmit = async (data: any) => {
    try {
      if (selectedCustomer) {
        await updateMutation.mutateAsync({ id: selectedCustomer.id, ...data });
        enqueueSnackbar('Cliente actualizado', { variant: 'success' });
      } else {
        await createMutation.mutateAsync(data);
        enqueueSnackbar('Cliente creado', { variant: 'success' });
      }
      handleClose();
    } catch (error: unknown) {
      enqueueSnackbar(getErrorMessage(error), { variant: 'error' });
    }
  };

  const renderContent = () => {
    if (isTableLoading) return <S.LoadingBox><CircularProgress /></S.LoadingBox>;
    if (isError) return (
      <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => refetch()}>Reintentar</Button>}>
        No se pudieron cargar los clientes. Verificá tu conexión.
      </Alert>
    );
    return (
      <CustomerTable
        customers={customers || []}
        onView={(c) => handleAction('view', c)}
      />
    );
  };

  return (
    <S.PageRoot>
      <S.PageHeader direction="row">
        <S.PageTitle variant="h4">Clientes</S.PageTitle>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleAction('create')}
        >
          Nuevo Cliente
        </Button>
      </S.PageHeader>

      {renderContent()}

      <Dialog open={isModalOpen} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {getTitle()}
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
          <CustomerForm
            key={modalMode ?? 'create'}
            initialData={selectedCustomer}
            onSubmit={handleFormSubmit}
            isLoading={createMutation.isPending || updateMutation.isPending}
            onCancel={handleCancelForm}
            isReadOnly={modalMode === 'view'}
          />
        </DialogContent>
      </Dialog>
    </S.PageRoot>
  );
};