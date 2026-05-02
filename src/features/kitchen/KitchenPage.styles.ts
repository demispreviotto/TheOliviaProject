import { styled } from '@mui/material/styles';
import { Box, Stack, Typography } from '@mui/material';

export const PageRoot = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 2, 10, 2),
  maxWidth: 900,
  margin: '0 auto',
}));

export const PageHeader = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(1),
}));

export const PageTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  color: theme.palette.primary.main,
}));
