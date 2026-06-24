import {
  Card, CardContent, CardHeader, Chip, CircularProgress,
  Divider, List, ListItem, ListItemText, Stack, Typography,
} from '@mui/material';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import { useTodayOrders } from '../api/useTodayOrders';
import { formatCurrency } from '../../../utils/formatters';
import type { Order, OrderStatus } from '../../order/api/order.types';

const STATUS_CHIP: Record<OrderStatus, { label: string; color: 'default' | 'warning' | 'info' | 'success' | 'error' }> = {
  pending:   { label: 'Pendiente', color: 'default' },
  cooking:   { label: 'En cocina', color: 'warning' },
  ready:     { label: 'Listo',     color: 'success' },
  delivered: { label: 'Entregado', color: 'info' },
  cancelled: { label: 'Cancelado', color: 'error' },
};

const clientName = (order: Order) =>
  order.customer?.company_name ?? order.customer?.full_name ?? '—';

export const TodayDeliveriesCard = () => {
  const { data: orders, isLoading } = useTodayOrders();

  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardHeader
        title={
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Entregas de hoy
          </Typography>
        }
        subheader={
          !isLoading && orders
            ? `${orders.length} pedido${orders.length !== 1 ? 's' : ''}`
            : undefined
        }
        sx={{ pb: 0 }}
      />
      <CardContent sx={{ pt: 1 }}>
        {isLoading && (
          <Stack sx={{ alignItems: 'center', py: 3 }}>
            <CircularProgress size={24} />
          </Stack>
        )}

        {!isLoading && orders?.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
            Sin entregas programadas para hoy.
          </Typography>
        )}

        {!isLoading && orders && orders.length > 0 && (
          <List disablePadding>
            {orders.map((order, idx) => {
              const chip = STATUS_CHIP[order.order_status];
              return (
                <Stack key={order.id}>
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <ListItemText
                      primary={
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                          {order.delivery_mode === 'delivery'
                            ? <LocalShippingOutlinedIcon fontSize="small" color="action" />
                            : <StorefrontOutlinedIcon fontSize="small" color="action" />}
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {clientName(order)}
                          </Typography>
                        </Stack>
                      }
                      secondary={
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mt: 0.5 }}>
                          <Chip
                            label={chip.label}
                            color={chip.color}
                            size="small"
                            variant="outlined"
                          />
                          <Typography variant="caption" color="text.secondary">
                            {formatCurrency(order.total_price)}
                          </Typography>
                        </Stack>
                      }
                    />
                  </ListItem>
                  {idx < orders.length - 1 && <Divider />}
                </Stack>
              );
            })}
          </List>
        )}
      </CardContent>
    </Card>
  );
};
