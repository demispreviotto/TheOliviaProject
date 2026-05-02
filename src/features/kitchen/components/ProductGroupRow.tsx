import { Checkbox, Button, Chip, Stack, Typography, Box, CircularProgress } from '@mui/material';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import type { KitchenProductGroup, KitchenRawItem } from '../api/kitchen.types';
import type { OrderItemStatus } from '../../order/api/order.types';
import { STATUS_LABELS } from '../utils/kitchen.utils';

interface Props {
  group: KitchenProductGroup;
  checked: boolean;
  onCheckChange: (checked: boolean) => void;
  onAction: (itemIds: string[], newStatus: OrderItemStatus, orderIds: string[]) => void;
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

const uniqueOrderIds = (items: KitchenRawItem[]) => [...new Set(items.map((i) => i.orderId))];

export const ProductGroupRow = ({ group, checked, onCheckChange, onAction, isLoading }: Props) => {
  const statusMap = groupByStatus(group.items);
  const statuses = [...statusMap.keys()];

  const allReady = statuses.every((s) => s === 'ready' || s === 'delivered' || s === 'cancelled');
  const anyPending = statuses.some((s) => s === 'pending');
  // "Listo" button: no pending items, but there are cooking items to finish
  const showListo = !anyPending && statuses.some((s) => s === 'cooking');

  const handleAction = () => {
    if (anyPending) {
      const targets = group.items.filter((i) => i.status === 'pending');
      onAction(targets.map((i) => i.id), 'cooking', uniqueOrderIds(targets));
    } else if (showListo) {
      const targets = group.items.filter((i) => i.status === 'cooking');
      onAction(targets.map((i) => i.id), 'ready', uniqueOrderIds(targets));
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

        {allReady && (
          <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5, color: 'success.main' }}>
            <TaskAltIcon fontSize="small" />
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
              Todo listo
            </Typography>
          </Stack>
        )}

        {!allReady && (anyPending || showListo) && (
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
      </Stack>
    </Stack>
  );
};
