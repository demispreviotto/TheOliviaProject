// src/features/products/components/ProductTable.tsx
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Chip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import type { Product } from '../api/product.types';
import { EmptyState } from '../../../components/ui/EmptyState';

interface Props {
  products: Product[];
  onEdit: (product: Product) => void;
  onView: (product: Product) => void;
}

export const ProductTable = ({ products, onEdit, onView }: Props) => {
  if (products.length === 0) return <EmptyState message="Todavía no hay productos en el catálogo." />;
  
  const formatPresentation = (product: Product): string => {
    if (product.grams) {
      return `${product.grams}g`;
    }
    return `${product.units}u`;
  };

  return (
    <TableContainer component={Paper} elevation={2}>
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: 'action.hover' }}>
            <TableCell sx={{ fontWeight: 'bold' }}>Producto</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Categoría</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>P. Minorista</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>P. Mayorista</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Estado</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id} hover>
              <TableCell>
                <div style={{ fontWeight: 500 }}>{product.variety}</div>
                <div style={{ fontSize: '0.75rem', color: 'gray' }}>{formatPresentation(product)}</div>
              </TableCell>
              <TableCell>
                <Chip label={product.product_category} size="small" variant="outlined" />
              </TableCell>
              <TableCell>${product.retail_price}</TableCell>
              <TableCell>${product.wholesale_price}</TableCell>
              <TableCell>
                <Chip 
                  label={product.is_active ? 'Activo' : 'Inactivo'} 
                  color={product.is_active ? 'success' : 'default'}
                  size="small"
                />
              </TableCell>
              <TableCell align="right">
                <IconButton onClick={() => onView(product)} color="primary" size="small">
                  <VisibilityIcon />
                </IconButton>
                <IconButton onClick={() => onEdit(product)} color="primary" size="small">
                  <EditIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};