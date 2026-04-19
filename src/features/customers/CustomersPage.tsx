// src/features/customers/CustomersPage.tsx
import { useState } from 'react';
import { 
 Button, CircularProgress, 
  Dialog, DialogContent, DialogTitle, IconButton 
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { CustomerForm } from './components/CustomerForm';
import { CustomerTable } from './components/CustomerTable';
import { useCustomers } from './api/useCustomers';
import { useCreateCustomer } from './api/useCreateCustomer';
import { useUpdateCustomer } from './api/useUpdateCustomer';
import { useSnackbar } from 'notistack';
import type { Customer } from './api/customer.types';
import * as S from './CustomersPage.styles'

export const CustomersPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { data: customers, isLoading: isTableLoading } = useCustomers();
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
    } catch (error: any) {
      enqueueSnackbar(`Error: ${error.message}`, { variant: 'error' });
    }
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

      {isTableLoading ? (
        <S.LoadingBox><CircularProgress /></S.LoadingBox>
      ) : (
       <CustomerTable 
    customers={customers || []} 
    onEdit={(c) => handleAction('edit', c)} 
    onView={(c) => handleAction('view', c)}
  />
      )}

      {/* Shared Create/Edit Modal */}
      <Dialog open={isModalOpen} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
{getTitle()}
          <IconButton onClick={handleClose}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <CustomerForm 
initialData={selectedCustomer}
            onSubmit={handleFormSubmit}
            isLoading={createMutation.isPending || updateMutation.isPending}
            onCancel={handleClose}
            isReadOnly={modalMode === 'view'}
          />
        </DialogContent>
      </Dialog>
    </S.PageRoot>
  );
};