import { styled } from '@mui/material/styles';
import { Paper } from '@mui/material';

export const FormContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  maxWidth: '400px',
  width: '100%',
  borderRadius: (theme.shape.borderRadius as number) * 2,
}));

export const FormWrapper = styled('form')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}));