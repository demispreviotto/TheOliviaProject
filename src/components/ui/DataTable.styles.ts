import { styled } from '@mui/material/styles';
import { TableRow } from '@mui/material';

export const HeaderRow = styled(TableRow)(({ theme }) => ({
  backgroundColor: theme.palette.action.hover,
  '& th': {
    fontWeight: 700,
  },
}));
