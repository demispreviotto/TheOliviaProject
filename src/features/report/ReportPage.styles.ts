import { styled } from '@mui/material/styles';
import { Box, Stack, Typography } from '@mui/material';

export const PageRoot = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 3),
  maxWidth: 1100,
  margin: '0 auto',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

export const NavRow = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: theme.spacing(3),
}));

export const MonthTitle = styled(Typography)({
  fontWeight: 700,
  minWidth: 220,
  textAlign: 'center',
}) as typeof Typography;

export const LoadingWrapper = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
});

export const KpiLabel = styled(Typography)({
  display: 'block',
}) as typeof Typography;

export const KpiValue = styled(Typography)({
  fontWeight: 700,
}) as typeof Typography;

export const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  marginBottom: theme.spacing(1.5),
})) as typeof Typography;

export const SectionHeader = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: theme.spacing(1.5),
}));

export const EmptyRow = styled(Stack)({
  flexDirection: 'row',
  alignItems: 'center',
});
