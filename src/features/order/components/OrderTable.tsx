import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Chip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import type { Order } from '../api/order.types';
import * as S from './OrderTable.styles';
import { EmptyState } from '../../../components/ui/EmptyState';

// Senior tip: Move config objects outside the component to prevent re-renders
const statusConfig: Record<string, { label: string, color: "warning" | "info" | "secondary" | "success" | "error" | "default" }> = {
  pending: { label: 'Pendiente', color: 'warning' },
  cooking: { label: 'En Cocina', color: 'info' },
  ready: { label: 'Listo', color: 'secondary' },
  delivered: { label: 'Entregado', color: 'success' },
  cancelled: { label: 'Cancelado', color: 'error' },
};

interface Props {
  orders: Order[];
  onEdit: (order: Order) => void;
  onView: (order: Order) => void;
}

export const OrderTable = ({ orders, onEdit, onView }: Props) => {
  if (orders.length === 0) return <EmptyState message="Todavía no hay pedidos registrados." />;

  return (
    <TableContainer component={Paper} elevation={2}>
      <Table>
        <TableHead>
          <S.StyledHeaderRow>
            <TableCell>Fecha Entrega</TableCell>
            <TableCell>Cliente</TableCell>
            <TableCell>Estado</TableCell>
            <TableCell>Pago</TableCell>
            <TableCell>Total</TableCell>
            <TableCell align="right">Acciones</TableCell>
          </S.StyledHeaderRow>
        </TableHead>
        <TableBody>
          {orders.map((order) => {
            const status = statusConfig[order.order_status] || statusConfig.pending;
            
            return (
              <TableRow key={order.id} hover>
                <TableCell>
                  {new Date(order.delivery_date).toLocaleDateString('es-AR')}
                </TableCell>
                
                <TableCell>
                    {order.customer?.company_name || order.customer?.full_name || 'Cliente no encontrado'}
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

                <TableCell align="right">
                  <IconButton onClick={() => onView(order)} color="primary" size="small">
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton onClick={() => onEdit(order)} color="primary" size="small">
                    <EditIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};