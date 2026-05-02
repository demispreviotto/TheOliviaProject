import type { ReactNode } from 'react';
import { Fab, Tooltip, CircularProgress } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import type { OrderItemStatus } from '../../order/api/order.types';

interface Props {
  count: number;
  targetStatus: OrderItemStatus | null;
  isLoading: boolean;
  onClick: () => void;
}

const CONFIG: Partial<Record<OrderItemStatus, { label: string; color: 'success' | 'warning'; icon: ReactNode }>> = {
  cooking: { label: 'A Cocina', color: 'warning', icon: <RestaurantIcon fontSize="large" /> },
  ready:   { label: 'Listos',   color: 'success', icon: <CheckIcon fontSize="large" /> },
};

export const KitchenFAB = ({ count, targetStatus, isLoading, onClick }: Props) => {
  if (!targetStatus || count === 0) return null;

  const config = CONFIG[targetStatus];
  if (!config) return null;

  return (
    <Tooltip title={`${config.label}: ${count} ítem(s)`} placement="left">
      <Fab
        color={config.color}
        onClick={onClick}
        disabled={isLoading}
        sx={{
          position: 'fixed',
          bottom: { xs: 24, sm: 32 },
          right: { xs: 16, sm: 32 },
          zIndex: 1200,
          width: 64,
          height: 64,
        }}
      >
        {isLoading ? <CircularProgress size={28} color="inherit" /> : config.icon}
      </Fab>
    </Tooltip>
  );
};
