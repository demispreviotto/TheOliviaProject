import {
  Card, CardContent, CardHeader, Chip, CircularProgress,
  Divider, List, ListItem, ListItemText, Stack, Typography,
} from '@mui/material';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import { useTodayOrders } from '../api/useTodayOrders';
import { EmptyState } from '../../../components/ui/EmptyState';
import { formatCurrency } from '../../../utils/formatters';
import type { Order, OrderStatus } from '../../order/api/order.types';
import * as S from './TodayDeliveriesCard.styles';

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
          <S.CardTitle variant="subtitle1">Entregas de hoy</S.CardTitle>
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
          <S.LoadingWrapper>
            <CircularProgress size={24} />
          </S.LoadingWrapper>
        )}

        {!isLoading && orders?.length === 0 && (
          <EmptyState message="Sin entregas programadas para hoy." />
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
                        <S.OrderNameRow spacing={1}>
                          {order.delivery_mode === 'delivery'
                            ? <LocalShippingOutlinedIcon fontSize="small" color="action" />
                            : <StorefrontOutlinedIcon fontSize="small" color="action" />}
                          <S.ClientName variant="body2">{clientName(order)}</S.ClientName>
                        </S.OrderNameRow>
                      }
                      secondary={
                        <S.OrderMeta spacing={1}>
                          <Chip
                            label={chip.label}
                            color={chip.color}
                            size="small"
                            variant="outlined"
                          />
                          <Typography variant="caption" color="text.secondary">
                            {formatCurrency(order.total_price)}
                          </Typography>
                        </S.OrderMeta>
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
