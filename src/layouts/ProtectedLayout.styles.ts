import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';

export const LayoutRoot = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  width: '100%',
}) as typeof Box;

export const PageContainer = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  maxWidth: '1440px', 
  margin: '0 auto',
  width: '100%',
  boxSizing: 'border-box',
})) as typeof Box;