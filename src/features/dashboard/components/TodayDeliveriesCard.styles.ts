import { styled } from '@mui/material/styles';
import { Stack, Typography } from '@mui/material';

export const CardTitle = styled(Typography)({
  fontWeight: 600,
}) as typeof Typography;

export const LoadingWrapper = styled(Stack)(({ theme }) => ({
  alignItems: 'center',
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(3),
}));

export const OrderNameRow = styled(Stack)({
  flexDirection: 'row',
  alignItems: 'center',
});

export const ClientName = styled(Typography)({
  fontWeight: 500,
}) as typeof Typography;

export const OrderMeta = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: theme.spacing(0.5),
}));
