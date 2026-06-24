import { Box, Button, Card, CardContent, Grid, Skeleton, Stack, Typography } from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';
import { Link } from 'react-router-dom';
import { useMonthlyReport } from '../api/useMonthlyReport';
import { formatCurrency } from '../../../utils/formatters';

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const Kpi = ({ label, value }: { label: string; value: string }) => (
  <Box>
    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
      {label}
    </Typography>
    <Typography variant="h6" sx={{ fontWeight: 700 }}>
      {value}
    </Typography>
  </Box>
);

export const MonthlyKpiBar = () => {
  const now = new Date();
  const { data, isLoading } = useMonthlyReport(now.getFullYear(), now.getMonth());

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <BarChartIcon color="primary" fontSize="small" />
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {MONTH_NAMES[now.getMonth()]} {now.getFullYear()}
            </Typography>
          </Stack>
          <Button
            component={Link}
            to="/reporte"
            size="small"
            variant="outlined"
            endIcon={<BarChartIcon />}
          >
            Ver reporte
          </Button>
        </Stack>

        {isLoading ? (
          <Grid container spacing={2}>
            {[1, 2, 3, 4].map((i) => (
              <Grid key={i} size={{ xs: 6, sm: 3 }}>
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="80%" height={32} />
              </Grid>
            ))}
          </Grid>
        ) : data ? (
          <Grid container spacing={2}>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Kpi label="Pedidos" value={String(data.kpis.total_orders)} />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Kpi label="Unidades" value={String(data.kpis.total_units)} />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Kpi label="Ingresos esperados" value={formatCurrency(data.kpis.total_income)} />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Kpi
                label="Pendiente de cobro"
                value={formatCurrency(data.kpis.pending_income)}
              />
            </Grid>
          </Grid>
        ) : null}
      </CardContent>
    </Card>
  );
};
