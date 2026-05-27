import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TableSortLabel, Paper, Chip
} from '@mui/material';
import { type Product } from '../api/product.types';
import { EmptyState } from '../../../components/ui/EmptyState';
import { categoryLabelMap, formatPresentation } from '../utils/products.utils';
import { useTableSort } from '../../../utils/useTableSort';

type ProductSortKey = 'variety' | 'retail_price' | 'wholesale_price';

const getProductValue = (product: Product, key: ProductSortKey): string | number => {
  switch (key) {
    case 'variety':          return product.variety;
    case 'retail_price':     return product.retail_price;
    case 'wholesale_price':  return product.wholesale_price;
  }
};

interface Props {
  products: Product[];
  onView: (product: Product) => void;
}

export const ProductTable = ({ products, onView }: Props) => {
  const { sorted, sortKey, sortDir, handleSort } = useTableSort<Product, ProductSortKey>(products, getProductValue);

  if (sorted.length === 0) return <EmptyState message="Todavía no hay productos en el catálogo." />;

  return (
    <TableContainer component={Paper} elevation={2}>
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: 'action.hover' }}>
            <TableCell sx={{ fontWeight: 'bold' }} sortDirection={sortKey === 'variety' ? sortDir : false}>
              <TableSortLabel
                active={sortKey === 'variety'}
                direction={sortKey === 'variety' ? sortDir : 'asc'}
                onClick={() => handleSort('variety')}
              >
                Producto
              </TableSortLabel>
            </TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Categoría</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }} sortDirection={sortKey === 'retail_price' ? sortDir : false}>
              <TableSortLabel
                active={sortKey === 'retail_price'}
                direction={sortKey === 'retail_price' ? sortDir : 'asc'}
                onClick={() => handleSort('retail_price')}
              >
                P. Minorista
              </TableSortLabel>
            </TableCell>
            <TableCell sx={{ fontWeight: 'bold' }} sortDirection={sortKey === 'wholesale_price' ? sortDir : false}>
              <TableSortLabel
                active={sortKey === 'wholesale_price'}
                direction={sortKey === 'wholesale_price' ? sortDir : 'asc'}
                onClick={() => handleSort('wholesale_price')}
              >
                P. Mayorista
              </TableSortLabel>
            </TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Estado</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sorted.map((product) => (
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
