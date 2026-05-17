import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip
} from '@mui/material';
import { type Product } from '../api/product.types';
import { EmptyState } from '../../../components/ui/EmptyState';
import { categoryLabelMap, formatPresentation } from '../utils/products.utils';

interface Props {
  products: Product[];
  onView: (product: Product) => void;
}

export const ProductTable = ({ products, onView }: Props) => {
  if (products.length === 0) return <EmptyState message="Todavía no hay productos en el catálogo." />;

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
          </TableRow>
        </TableHead>
        <TableBody>
          {products.map((product) => (
            <TableRow
              key={product.id}
              hover
              onClick={() => onView(product)}
              sx={{ cursor: 'pointer' }}
            >
              <TableCell>
                <div style={{ fontWeight: 500 }}>{product.variety}</div>
                <div style={{ fontSize: '0.75rem', color: 'gray' }}>{formatPresentation(product)}</div>
              </TableCell>
              <TableCell>
                {categoryLabelMap[product.product_category] || product.product_category}
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};