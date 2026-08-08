import { useState } from 'react';
import {
  Card, CardContent, CircularProgress, Divider, Grid, IconButton, Stack, Typography,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useMonthlyReport } from './api/useMonthlyReport';
import { ProductsBreakdownTable } from './components/ProductsBreakdownTable';
import { ClientComparisonTable } from './components/ClientComparisonTable';
import { formatCurrency } from '../../utils/formatters';
import * as S from './ReportPage.styles';

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
      <S.KpiLabel variant="caption" color="text.secondary">
        {label}
      </S.KpiLabel>
      <S.KpiValue variant="h5" color={color ?? 'text.primary'}>
        {value}
      </S.KpiValue>
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
    <S.PageRoot>
      <S.NavRow spacing={1}>
        <IconButton onClick={prevMonth} size="small">
          <ChevronLeftIcon />
        </IconButton>
        <S.MonthTitle variant="h5">
          Reporte — {MONTH_NAMES[month]} {year}
        </S.MonthTitle>
        <IconButton onClick={nextMonth} size="small" disabled={isCurrentMonth}>
          <ChevronRightIcon />
        </IconButton>
      </S.NavRow>

      {isLoading && (
        <S.LoadingWrapper sx={{ py: 6 }}>
          <CircularProgress />
        </S.LoadingWrapper>
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
          <div>
            <S.SectionTitle variant="h6">Productos del mes</S.SectionTitle>
            <ProductsBreakdownTable rows={data.products} />
          </div>

          <Divider />

          {/* Clients table */}
          <div>
            <S.SectionHeader spacing={1}>
              <S.SectionTitle variant="h6" sx={{ mb: 0 }}>Clientes</S.SectionTitle>
              {/* {data.kpis.cancelled_orders === 0 && (
                <Typography variant="caption" color="text.secondary">
                  (comparación vs mes anterior)
                </Typography>
              )} */}
            </S.SectionHeader>
            <ClientComparisonTable rows={data.clients} />
          </div>
        </Stack>
      )}
    </S.PageRoot>
  );
};
