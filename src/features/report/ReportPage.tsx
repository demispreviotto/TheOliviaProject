import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CancelIcon from '@mui/icons-material/Cancel';
import { useMonthlyReport } from './api/useMonthlyReport';
import { ProductsBreakdownTable } from './components/ProductsBreakdownTable';
import { ClientComparisonTable } from './components/ClientComparisonTable';
import { formatCurrency } from '../../utils/formatters';

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

interface KpiCardProps {
  label: string;
  value: string;
  sub?: string;
  color?: string;
}

const KpiCard = ({ label, value, sub, color }: KpiCardProps) => (
  <Card variant="outlined" sx={{ height: '100%' }}>
    <CardContent>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
        {label}
      </Typography>
      <Typography variant="h5" color={color ?? 'text.primary'} sx={{ fontWeight: 700, mt: 0.5 }}>
        {value}
      </Typography>
      {sub && (
        <Typography variant="caption" color="text.secondary">
          {sub}
        </Typography>
      )}
    </CardContent>
  </Card>
);

export const ReportPage = () => {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const { data, isLoading, isError } = useMonthlyReport(year, month);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  };
  const nextMonth = () => {
    const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();
    if (isCurrentMonth) return;
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  };

  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1100, mx: 'auto' }}>
      {/* Header */}
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 3 }}>
        <IconButton onClick={prevMonth} size="small">
          <ChevronLeftIcon />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: 700, minWidth: 220, textAlign: 'center' }}>
          Reporte — {MONTH_NAMES[month]} {year}
        </Typography>
        <IconButton onClick={nextMonth} size="small" disabled={isCurrentMonth}>
          <ChevronRightIcon />
        </IconButton>
      </Stack>

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {isError && (
        <Typography color="error">Error al cargar el reporte. Intentá de nuevo.</Typography>
      )}

      {!isLoading && !isError && data && (
        <Stack spacing={3}>
          {/* KPI bar */}
          <Grid container spacing={2}>
            <Grid size={{ xs: 6, sm: 4, md: 2 }}>
              <KpiCard label="Pedidos" value={String(data.kpis.total_orders)} />
            </Grid>
            <Grid size={{ xs: 6, sm: 4, md: 2 }}>
              <KpiCard label="Unidades" value={String(data.kpis.total_units)} />
            </Grid>
            <Grid size={{ xs: 6, sm: 4, md: 2 }}>
              <KpiCard
                label="Ingresos esperados"
                value={formatCurrency(data.kpis.total_income)}
                color="success.main"
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 4, md: 2 }}>
              <KpiCard
                label="Cobrado"
                value={formatCurrency(data.kpis.collected_income)}
                sub={`Pendiente: ${formatCurrency(data.kpis.pending_income)}`}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 4, md: 2 }}>
              <KpiCard
                label="Efectivo / Trans."
                value={formatCurrency(data.kpis.cash_amount)}
                sub={`Transf: ${formatCurrency(data.kpis.transfer_amount)}`}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 4, md: 2 }}>
              <KpiCard
                label="Cancelados"
                value={String(data.kpis.cancelled_orders)}
                sub={data.kpis.cancelled_value > 0 ? `Valor: ${formatCurrency(data.kpis.cancelled_value)}` : undefined}
                color={data.kpis.cancelled_orders > 0 ? 'error.main' : undefined}
              />
            </Grid>
          </Grid>

          <Divider />

          {/* Products table */}
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1.5 }}>
              Productos del mes
            </Typography>
            {data.products.length === 0 ? (
              <Typography color="text.secondary">Sin productos este mes.</Typography>
            ) : (
              <ProductsBreakdownTable rows={data.products} />
            )}
          </Box>

          <Divider />

          {/* Clients table */}
          <Box>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Clientes
              </Typography>
              {data.kpis.cancelled_orders === 0 && (
                <Typography variant="caption" color="text.secondary">
                  (comparación vs mes anterior)
                </Typography>
              )}
            </Stack>
            {data.clients.length === 0 ? (
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <CancelIcon color="disabled" fontSize="small" />
                <Typography color="text.secondary">Sin pedidos este mes.</Typography>
              </Stack>
            ) : (
              <ClientComparisonTable rows={data.clients} />
            )}
          </Box>
        </Stack>
      )}
    </Box>
  );
};
