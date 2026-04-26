import { styled } from '@mui/material/styles';
import { TableRow, TableCell, Typography } from '@mui/material';

export const StyledHeaderRow = styled(TableRow)(({ theme }) => ({
  backgroundColor: theme.palette.action.hover,
  '& th': {
    fontWeight: 'bold',
  },
}));

export const PriceCell = styled(TableCell)({
  fontWeight: 'bold',
});

export const CustomerName = styled(Typography)(({ theme }) => ({
  fontWeight: 500,
  color: theme.palette.text.primary,
})) as typeof Typography;