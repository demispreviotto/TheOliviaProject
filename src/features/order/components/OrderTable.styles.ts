import { styled } from '@mui/material/styles';
import { Typography } from '@mui/material';

export const PriceText = styled('span')({
  fontWeight: 'bold',
});

export const CustomerName = styled(Typography)(({ theme }) => ({
  fontWeight: 500,
  color: theme.palette.text.primary,
})) as typeof Typography;