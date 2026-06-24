import { Box, Button, Card, CardContent, Grid, Skeleton } from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';
import { Link } from 'react-router-dom';
import { useMonthlyReport } from '../api/useMonthlyReport';
import { formatCurrency } from '../../../utils/formatters';
import * as S from './MonthlyKpiBar.styles';

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const Kpi = ({ label, value }: { label: string; value: string }) => (
  <Box>
    <S.KpiLabel variant="caption" color="text.secondary">
      {label}
    </S.KpiLabel>
    <S.KpiValue variant="h6">{value}</S.KpiValue>
  </Box>
);

export const MonthlyKpiBar = () => {
  const now = new Date();
  const { data, isLoading } = useMonthlyReport(now.getFullYear(), now.getMonth());

  return (
    <Card variant="outlined">
      <CardContent>
        <S.BarHeader>
          <S.MonthInfo spacing={1}>
            <BarChartIcon color="primary" fontSize="small" />
            <S.MonthTitle variant="subtitle1">
              {MONTH_NAMES[now.getMonth()]} {now.getFullYear()}
            </S.MonthTitle>
          </S.MonthInfo>
          <Button
            component={Link}
            to="/reporte"
            size="small"
            variant="outlined"
            endIcon={<BarChartIcon />}
          >
            Ver reporte
          </Button>
        </S.BarHeader>

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
              <Kpi label="Pendiente de cobro" value={formatCurrency(data.kpis.pending_income)} />
            </Grid>
          </Grid>
        ) : null}
      </CardContent>
    </Card>
  );
};
