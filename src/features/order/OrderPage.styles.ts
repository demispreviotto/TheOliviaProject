import { styled } from '@mui/material/styles';
import { Stack, Typography, Box } from '@mui/material';

export const PageHeader = styled(Stack)(({ theme }) => ({
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(4),
})) as typeof Stack;

export const PageTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  color: theme.palette.text.primary,
})) as typeof Typography;

export const PageRoot = styled(Box)(({
  width: '100%',
})) as typeof Box;

export const LoadingBox = styled(Box)(({
  width: '100%',
  display:"flex", justifyContent:"center"
})) as typeof Box;