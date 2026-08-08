import { Chip } from '@mui/material';
import type { Order } from '../api/order.types';
import * as S from './OrderTable.styles';
import { DataTable, type DataTableColumn } from '../../../components/ui/DataTable';
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

const columns: DataTableColumn<Order, OrderSortKey>[] = [
  {
    id: 'delivery_date', label: 'Fecha Entrega', sortKey: 'delivery_date',
    render: (order) => new Date(order.delivery_date).toLocaleDateString('es-AR'),
  },
  {
    id: 'customer', label: 'Cliente', sortKey: 'customer',
    render: (order) => order.customer?.full_name || 'Cliente no encontrado',
  },
  {
    id: 'address', label: 'Dirección',
    render: (order) => order.delivery_mode === 'delivery'
      ? (order.customer?.delivery_address || '—')
      : 'Retira',
  },
  {
    id: 'status', label: 'Estado',
    render: (order) => {
      const status = statusConfig[order.order_status] || statusConfig.pending;
      return <Chip label={status.label} color={status.color} size="small" />;
    },
  },
  {
    id: 'payment', label: 'Pago',
    render: (order) => (
      <Chip
        label={order.payment_state === 'paid' ? 'Pagado' : 'Pendiente'}
        variant="outlined"
        size="small"
        color={order.payment_state === 'paid' ? 'success' : 'warning'}
      />
    ),
  },
  {
    id: 'total_price', label: 'Total', sortKey: 'total_price',
    render: (order) => <S.PriceText>${Number(order.total_price).toFixed(2)}</S.PriceText>,
  },
];

interface Props {
  orders: Order[];
  onView: (order: Order) => void;
}

export const OrderTable = ({ orders, onView }: Props) => {
  const { sorted, sortKey, sortDir, handleSort } = useTableSort<Order, OrderSortKey>(orders, getOrderValue);

  return (
    <DataTable
      columns={columns}
      rows={sorted}
      getRowKey={(order) => order.id}
      onRowClick={onView}
      sort={{ sortKey, sortDir, onSort: handleSort }}
      emptyMessage="Todavía no hay pedidos registrados."
    />
  );
};
