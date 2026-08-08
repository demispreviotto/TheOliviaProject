import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TableSortLabel, Paper, Chip
} from '@mui/material';
import type { Order } from '../api/order.types';
import * as S from './OrderTable.styles';
import { EmptyState } from '../../../components/ui/EmptyState';
import { useTableSort } from '../../../utils/useTableSort';

const statusConfig: Record<string, { label: string, color: "warning" | "info" | "secondary" | "success" | "error" | "default" }> = {
  pending: { label: 'Pendiente', color: 'warning' },
  cooking: { label: 'En Cocina', color: 'info' },
  ready: { label: 'Listo', color: 'secondary' },
  delivered: { label: 'Entregado', color: 'success' },
  cancelled: { label: 'Cancelado', color: 'error' },
};

type OrderSortKey = 'delivery_date' | 'customer' | 'total_price';

const getOrderValue = (order: Order, key: OrderSortKey): string | number | null => {
  switch (key) {
    case 'delivery_date': return order.delivery_date;
    case 'customer':      return order.customer?.full_name || null;
    case 'total_price':   return Number(order.total_price);
  }
};

interface Props {
  orders: Order[];
  onView: (order: Order) => void;
}

export const OrderTable = ({ orders, onView }: Props) => {
  const { sorted, sortKey, sortDir, handleSort } = useTableSort<Order, OrderSortKey>(orders, getOrderValue);

  if (sorted.length === 0) return <EmptyState message="Todavía no hay pedidos registrados." />;

  return (
    <TableContainer component={Paper} elevation={2}>
      <Table>
        <TableHead>
          <S.StyledHeaderRow>
            <TableCell sortDirection={sortKey === 'delivery_date' ? sortDir : false}>
              <TableSortLabel
                active={sortKey === 'delivery_date'}
                direction={sortKey === 'delivery_date' ? sortDir : 'asc'}
                onClick={() => handleSort('delivery_date')}
              >
                Fecha Entrega
              </TableSortLabel>
            </TableCell>
            <TableCell sortDirection={sortKey === 'customer' ? sortDir : false}>
              <TableSortLabel
                active={sortKey === 'customer'}
                direction={sortKey === 'customer' ? sortDir : 'asc'}
                onClick={() => handleSort('customer')}
              >
                Cliente
              </TableSortLabel>
            </TableCell>
            <TableCell>Dirección</TableCell>
            <TableCell>Estado</TableCell>
            <TableCell>Pago</TableCell>
            <TableCell sortDirection={sortKey === 'total_price' ? sortDir : false}>
              <TableSortLabel
                active={sortKey === 'total_price'}
                direction={sortKey === 'total_price' ? sortDir : 'asc'}
                onClick={() => handleSort('total_price')}
              >
                Total
              </TableSortLabel>
            </TableCell>
          </S.StyledHeaderRow>
        </TableHead>
        <TableBody>
          {sorted.map((order) => {
            const status = statusConfig[order.order_status] || statusConfig.pending;

            return (
              <TableRow
                key={order.id}
                hover
                onClick={() => onView(order)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell>
                  {new Date(order.delivery_date).toLocaleDateString('es-AR')}
                </TableCell>

                <TableCell>
                  {order.customer?.full_name || 'Cliente no encontrado'}
                </TableCell>

                <TableCell>
                  {order.delivery_mode === 'delivery'
                    ? (order.customer?.delivery_address || '—')
                    : 'Retira'}
                </TableCell>

                <TableCell>
                  <Chip
                    label={status.label}
                    color={status.color}
                    size="small"
                  />
                </TableCell>

                <TableCell>
                  <Chip
                    label={order.payment_state === 'paid' ? 'Pagado' : 'Pendiente'}
                    variant="outlined"
                    size="small"
                    color={order.payment_state === 'paid' ? 'success' : 'warning'}
                  />
                </TableCell>

                <S.PriceCell>
                  ${Number(order.total_price).toFixed(2)}
                </S.PriceCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
