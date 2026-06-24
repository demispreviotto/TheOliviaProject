import { styled } from '@mui/material/styles';
import { Stack, Typography } from '@mui/material';

export const BarHeader = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
}));

export const MonthInfo = styled(Stack)({
  flexDirection: 'row',
  alignItems: 'center',
});

export const MonthTitle = styled(Typography)({
  fontWeight: 600,
}) as typeof Typography;

export const KpiLabel = styled(Typography)({
  display: 'block',
}) as typeof Typography;

export const KpiValue = styled(Typography)({
  fontWeight: 700,
}) as typeof Typography;
