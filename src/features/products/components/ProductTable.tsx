import { Chip } from '@mui/material';
import { type Product } from '../api/product.types';
import { categoryLabelMap, formatPresentation } from '../utils/products.utils';
import { DataTable, type DataTableColumn } from '../../../components/ui/DataTable';
import { useTableSort } from '../../../utils/useTableSort';

type ProductSortKey = 'variety' | 'retail_price' | 'wholesale_price';

const getProductValue = (product: Product, key: ProductSortKey): string | number => {
  switch (key) {
    case 'variety':          return product.variety;
    case 'retail_price':     return product.retail_price;
    case 'wholesale_price':  return product.wholesale_price;
  }
};

const columns: DataTableColumn<Product, ProductSortKey>[] = [
  {
    id: 'variety', label: 'Producto', sortKey: 'variety',
    render: (product) => (
      <>
        <div style={{ fontWeight: 500 }}>{product.variety}</div>
        <div style={{ fontSize: '0.75rem', color: 'gray' }}>{formatPresentation(product)}</div>
      </>
    ),
  },
  {
    id: 'category', label: 'Categoría',
    render: (product) => categoryLabelMap[product.product_category] || product.product_category,
  },
  {
    id: 'retail_price', label: 'P. Minorista', sortKey: 'retail_price',
    render: (product) => `$${product.retail_price}`,
  },
  {
    id: 'wholesale_price', label: 'P. Mayorista', sortKey: 'wholesale_price',
    render: (product) => `$${product.wholesale_price}`,
  },
  {
    id: 'status', label: 'Estado',
    render: (product) => (
      <Chip
        label={product.is_active ? 'Activo' : 'Inactivo'}
        color={product.is_active ? 'success' : 'default'}
        size="small"
      />
    ),
  },
];

interface Props {
  products: Product[];
  onView: (product: Product) => void;
}

export const ProductTable = ({ products, onView }: Props) => {
  const { sorted, sortKey, sortDir, handleSort } = useTableSort<Product, ProductSortKey>(products, getProductValue);

  return (
    <DataTable
      columns={columns}
      rows={sorted}
      getRowKey={(product) => product.id}
      onRowClick={onView}
      sort={{ sortKey, sortDir, onSort: handleSort }}
      emptyMessage="Todavía no hay productos en el catálogo."
    />
  );
};
