import { styled } from '@mui/material/styles';
import { Box, Chip, Paper, Typography } from '@mui/material';

export const FormContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  maxWidth: 1000,
  margin: '0 auto',
  borderRadius: (theme.shape.borderRadius as number) * 2,
}));

export const FormWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
}));

export const ItemsHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(1),
  paddingBottom: theme.spacing(1),
  borderBottom: `2px solid ${theme.palette.divider}`,
}));

export const ItemListContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: 0,
});


export const ItemRowWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  padding: theme.spacing(1, 0),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

export const ItemRow = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(200px, 1fr) 90px 110px 110px 100px 80px 40px',
  gap: theme.spacing(1.5),
  alignItems: 'center',
  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr 1fr',
  },
}));

export const NoteFieldWrapper = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(1),
  paddingLeft: theme.spacing(2),
  borderLeft: `2px solid ${theme.palette.grey[300]}`,
}));


export const TotalContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginTop: theme.spacing(4),
  backgroundColor: theme.palette.grey[50],
  borderLeft: `5px solid ${theme.palette.primary.main}`,
}));

export const SummaryRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(1),
}));

export const TotalLabel = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  color: theme.palette.primary.main,
}));

export const RecommendationsWrapper = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  marginTop: theme.spacing(1),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(0.5),
}));

export const SuggestionChip = styled(Chip)(({ theme }) => ({
  cursor: 'pointer',
  borderStyle: 'dashed',
  backgroundColor: theme.palette.primary.main + '08',
  '&:hover': {
    backgroundColor: theme.palette.primary.main + '15',
  },
}));