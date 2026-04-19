import { useState } from 'react';
import { 
  Box, CircularProgress, Button, Dialog, DialogTitle, DialogContent, IconButton 
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { ProductTable } from './components/ProductTable';
import { ProductForm } from './components/ProductForm';
import { useProducts } from './api/useProducts';
import { useCreateProduct } from './api/useCreateProduct';
import { useUpdateProduct } from './api/useUpdateProduct';
import { useSnackbar } from 'notistack';
import type { Product } from './api/product.types';
import * as S from '../customers/CustomersPage.styles'; // Reuse these generic header styles!

export const ProductsPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { data: products, isLoading } = useProducts();
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();

  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view' | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleAction = (mode: 'create' | 'edit' | 'view', product?: Product) => {
    setSelectedProduct(product || null);
    setModalMode(mode);
  };

  const handleClose = () => {
    setModalMode(null);
    setSelectedProduct(null);
  };

  const handleFormSubmit = async (data: any) => {
    try {
      if (selectedProduct) {
        await updateMutation.mutateAsync({ id: selectedProduct.id, ...data });
        enqueueSnackbar('Producto actualizado', { variant: 'success' });
      } else {
        await createMutation.mutateAsync(data);
        enqueueSnackbar('Producto creado', { variant: 'success' });
      }
      handleClose();
    } catch (error: any) {
      enqueueSnackbar(`Error: ${error.message}`, { variant: 'error' });
    }
  };

  return (
    <S.PageRoot>
      <S.PageHeader direction="row">
        <S.PageTitle variant="h4">Productos</S.PageTitle>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={() => handleAction('create')}
        >
          Nuevo Producto
        </Button>
      </S.PageHeader>

      {isLoading ? (
        <S.LoadingBox><CircularProgress /></S.LoadingBox>
      ) : (
        <ProductTable 
          products={products || []} 
          onEdit={(p) => handleAction('edit', p)}
          onView={(p) => handleAction('view', p)}
        />
      )}

      <Dialog open={!!modalMode} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {modalMode === 'view' ? 'Detalles del Producto' : modalMode === 'edit' ? 'Editar Producto' : 'Nuevo Producto'}
          <IconButton onClick={handleClose}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <ProductForm 
            initialData={selectedProduct}
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