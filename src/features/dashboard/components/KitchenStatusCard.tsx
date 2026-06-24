import {
  Box, Button, Card, CardContent, CardHeader, CircularProgress,
  Divider, Stack, Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import { useNavigate } from 'react-router-dom';
import { useKitchenDashboard } from '../../kitchen/api/useKitchenDashboard';
import type { KitchenCategory } from '../../kitchen/api/kitchen.types';

const today = () => new Date().toISOString().slice(0, 10);

interface StatusCounts {
  pending: number;
  cooking: number;
  ready: number;
}

function countStatuses(categories: KitchenCategory[]): StatusCounts {
  const counts: StatusCounts = { pending: 0, cooking: 0, ready: 0 };
  for (const cat of categories) {
    for (const group of cat.groups) {
      for (const item of group.items) {
        if (item.status === 'pending') counts.pending += item.quantity;
        else if (item.status === 'cooking') counts.cooking += item.quantity;
        else if (item.status === 'ready') counts.ready += item.quantity;
      }
    }
  }
  return counts;
}

interface StatusRowProps {
  label: string;
  count: number;
  color: string;
}

const StatusRow = ({ label, count, color }: StatusRowProps) => (
  <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', py: 0.75 }}>
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color }} />
      <Typography variant="body2">{label}</Typography>
    </Stack>
    <Typography variant="body2" sx={{ fontWeight: 600 }}>
      {count} u
    </Typography>
  </Stack>
);

export const KitchenStatusCard = () => {
  const navigate = useNavigate();
  const { data: categories, isLoading } = useKitchenDashboard(today());
  const counts = categories ? countStatuses(categories) : null;
  const total = counts ? counts.pending + counts.cooking + counts.ready : 0;

  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardHeader
        title={
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <RestaurantIcon fontSize="small" color="primary" />
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Cocina — hoy
            </Typography>
          </Stack>
        }
        subheader={!isLoading && counts ? `${total} unidades en total` : undefined}
        sx={{ pb: 0 }}
      />
      <CardContent sx={{ pt: 1 }}>
        {isLoading && (
          <Stack sx={{ alignItems: 'center', py: 3 }}>
            <CircularProgress size={24} />
          </Stack>
        )}

        {!isLoading && counts && (
          <>
            {total === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
                Sin ítems en cocina para hoy.
              </Typography>
            ) : (
              <Stack divider={<Divider />}>
                <StatusRow label="Pendientes" count={counts.pending} color="text.disabled" />
                <StatusRow label="En cocina"  count={counts.cooking} color="warning.main" />
                <StatusRow label="Listos"     count={counts.ready}   color="success.main" />
              </Stack>
            )}

            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                onClick={() => navigate('/pedidos?new=true')}
                fullWidth
              >
                Nuevo pedido
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => navigate('/cocina')}
                fullWidth
              >
                Ver cocina
              </Button>
            </Stack>
          </>
        )}
      </CardContent>
    </Card>
  );
};
