import { Checkbox, Button, Chip, Stack, Typography, Box, CircularProgress } from '@mui/material';
import type { KitchenProductGroup, KitchenRawItem } from '../api/kitchen.types';
import type { OrderItemStatus } from '../../order/api/order.types';
import { STATUS_LABELS } from '../utils/kitchen.utils';

interface Props {
  group: KitchenProductGroup;
  date: string;
  checked: boolean;
  onCheckChange: (checked: boolean) => void;
  onAction: (itemIds: string[], newStatus: OrderItemStatus, orderId: string) => void;
  isLoading: boolean;
}

const STATUS_COLORS: Record<OrderItemStatus, 'warning' | 'info' | 'success' | 'error' | 'default'> = {
  pending: 'warning',
  cooking: 'info',
  ready: 'success',
  delivered: 'default',
  cancelled: 'error',
};

const groupByStatus = (items: KitchenRawItem[]) => {
  const map = new Map<OrderItemStatus, number>();
  for (const item of items) {
    map.set(item.status, (map.get(item.status) ?? 0) + item.quantity);
  }
  return map;
};

export const ProductGroupRow = ({ group, checked, onCheckChange, onAction, isLoading }: Props) => {
  const statusMap = groupByStatus(group.items);
  const statuses = [...statusMap.keys()];

  const allReady = statuses.every((s) => s === 'ready');
  const anyPending = statuses.some((s) => s === 'pending');
  const allCooking = statuses.every((s) => s === 'cooking');

  const handleAction = () => {
    if (anyPending) {
      const pendingItems = group.items.filter((i) => i.status === 'pending');
      onAction(pendingItems.map((i) => i.id), 'cooking', pendingItems[0].orderId);
    } else if (allCooking) {
      const cookingItems = group.items.filter((i) => i.status === 'cooking');
      onAction(cookingItems.map((i) => i.id), 'ready', cookingItems[0].orderId);
    }
  };

  return (
    <Stack
      direction="row"
      sx={{
        alignItems: 'center',
        justifyContent: 'space-between',
        py: 1.5,
        px: 1,
        borderRadius: 1,
        minHeight: 64,
        '&:not(:last-child)': { borderBottom: '1px solid', borderColor: 'divider' },
      }}
    >
      <Stack direction="row" sx={{ alignItems: 'center', gap: 1, flex: 1, minWidth: 0 }}>
        <Checkbox
          checked={checked}
          onChange={(e) => onCheckChange(e.target.checked)}
          sx={{ p: 0.5 }}
        />
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body1" sx={{ fontWeight: 600 }} noWrap>
            {group.productName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {group.presentation}
          </Typography>
        </Box>
      </Stack>

      <Stack direction="row" sx={{ alignItems: 'center', gap: 1, flexShrink: 0 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'secondary.main' }}>
          ×{group.totalQuantity}
        </Typography>

        <Stack direction="row" sx={{ gap: 0.5, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {[...statusMap.entries()].map(([status, qty]) => (
            <Chip
              key={status}
              label={`${qty} ${STATUS_LABELS[status]}`}
              color={STATUS_COLORS[status]}
              size="small"
              variant="outlined"
            />
          ))}
        </Stack>

        {!allReady && (
          <Button
            variant="contained"
            size="large"
            onClick={handleAction}
            disabled={isLoading}
            sx={{ minWidth: 120, minHeight: 48 }}
          >
            {isLoading ? (
              <CircularProgress size={20} color="inherit" />
            ) : anyPending ? (
              'A Cocina'
            ) : (
              'Listo'
            )}
          </Button>
        )}

        {allReady && (
          <Chip label="Todo listo" color="success" sx={{ minHeight: 36, px: 1 }} />
        )}
      </Stack>
    </Stack>
  );
};
