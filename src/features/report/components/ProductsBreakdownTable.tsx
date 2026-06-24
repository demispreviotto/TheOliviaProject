import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { PRODUCT_CATEGORIES } from '../../products/api/product.types';
import type { ProductReportRow } from '../api/report.types';
import { formatCurrency } from '../../../utils/formatters';

interface Props {
  rows: ProductReportRow[];
}

const categoryLabel = (id: string) =>
  PRODUCT_CATEGORIES.find((c) => c.id === id)?.label ?? id;

export const ProductsBreakdownTable = ({ rows }: Props) => {
  const totalUnits = rows.reduce((s, r) => s + r.total_units, 0);
  const totalRevenue = rows.reduce((s, r) => s + r.total_revenue, 0);
  const totalDiscount = rows.reduce((s, r) => s + r.total_discount, 0);

  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>Producto</TableCell>
          <TableCell>Categoría</TableCell>
          <TableCell align="right">Unidades</TableCell>
          <TableCell align="right">Ingresos</TableCell>
          <TableCell align="right">Descuentos</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.product_id} hover>
            <TableCell>{row.variety}</TableCell>
            <TableCell>{categoryLabel(row.product_category)}</TableCell>
            <TableCell align="right">{row.total_units}</TableCell>
            <TableCell align="right">{formatCurrency(row.total_revenue)}</TableCell>
            <TableCell align="right" sx={{ color: row.total_discount > 0 ? 'warning.main' : 'inherit' }}>
              {row.total_discount > 0 ? `-${formatCurrency(row.total_discount)}` : '—'}
            </TableCell>
          </TableRow>
        ))}
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
      </TableBody>
    </Table>
  );
};
