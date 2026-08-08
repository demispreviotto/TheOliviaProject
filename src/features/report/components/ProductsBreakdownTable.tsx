import { TableCell, TableRow, Typography } from '@mui/material';
import { PRODUCT_CATEGORIES } from '../../products/api/product.types';
import type { ProductReportRow } from '../api/report.types';
import { formatCurrency } from '../../../utils/formatters';
import { DataTable, type DataTableColumn } from '../../../components/ui/DataTable';
import { useTableSort } from '../../../utils/useTableSort';

interface Props {
  rows: ProductReportRow[];
}

const categoryLabel = (id: string) =>
  PRODUCT_CATEGORIES.find((c) => c.id === id)?.label ?? id;

type ProductReportSortKey = 'variety' | 'category' | 'total_revenue';

const getProductReportValue = (row: ProductReportRow, key: ProductReportSortKey): string | number => {
  switch (key) {
    case 'variety':       return row.variety;
    case 'category':      return categoryLabel(row.product_category);
    case 'total_revenue': return row.total_revenue;
  }
};

const columns: DataTableColumn<ProductReportRow, ProductReportSortKey>[] = [
  { id: 'variety', label: 'Producto', sortKey: 'variety', render: (row) => row.variety },
  { id: 'category', label: 'Categoría', sortKey: 'category', render: (row) => categoryLabel(row.product_category) },
  { id: 'total_units', label: 'Unidades', align: 'right', render: (row) => row.total_units },
  {
    id: 'total_revenue', label: 'Ingresos', align: 'right', sortKey: 'total_revenue',
    render: (row) => formatCurrency(row.total_revenue),
  },
  {
    id: 'total_discount', label: 'Descuentos', align: 'right',
    render: (row) => row.total_discount > 0 ? (
      <Typography variant="inherit" color="warning.main">-{formatCurrency(row.total_discount)}</Typography>
    ) : '—',
  },
];

export const ProductsBreakdownTable = ({ rows }: Props) => {
  const { sorted, sortKey, sortDir, handleSort } = useTableSort<ProductReportRow, ProductReportSortKey>(rows, getProductReportValue);
  const totalUnits = rows.reduce((s, r) => s + r.total_units, 0);
  const totalRevenue = rows.reduce((s, r) => s + r.total_revenue, 0);
  const totalDiscount = rows.reduce((s, r) => s + r.total_discount, 0);

  return (
    <DataTable
      columns={columns}
      rows={sorted}
      getRowKey={(row) => row.product_id}
      sort={{ sortKey, sortDir, onSort: handleSort }}
      size="small"
      emptyMessage="Sin productos este mes."
      footer={
        <TableRow sx={{ '& td': { fontWeight: 700, borderTop: '2px solid', borderColor: 'divider' } }}>
          <TableCell colSpan={2}>Total</TableCell>
          <TableCell align="right">{totalUnits}</TableCell>
          <TableCell align="right">{formatCurrency(totalRevenue)}</TableCell>
          <TableCell align="right">
            {totalDiscount > 0 ? (
              <Typography variant="inherit" color="warning.main" sx={{ fontWeight: 700 }}>
                -{formatCurrency(totalDiscount)}
              </Typography>
            ) : '—'}
          </TableCell>
        </TableRow>
      }
    />
  );
};
