import { styled } from '@mui/material/styles';
import { Box, Card, Typography, Stack, Grid } from '@mui/material';

export const HomeContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  maxWidth: '1200px',
  margin: '0 auto',
}));

// We move 'direction', 'justifyContent', and 'alignItems' here
export const HeaderStack = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(4),
}));

export const WelcomeTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  color: theme.palette.primary.main,
}));

// We move 'container' and 'spacing' logic here
export const DashboardGridContainer = styled(Grid)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  boxSizing: 'border-box',
  width: '100%',
  margin: theme.spacing(-1.5), // Adjusts for the gap
}));

// We handle 'xs' and 'md' width logic here
export const GridItemFull = styled(Grid)(({ theme }) => ({
  padding: theme.spacing(1.5),
  flexBasis: '100%',
  flexGrow: 0,
  maxWidth: '100%',
}));

export const GridItemHalf = styled(Grid)(({ theme }) => ({
  padding: theme.spacing(1.5),
  flexBasis: '100%',
  flexGrow: 0,
  maxWidth: '100%',
  [theme.breakpoints.up('md')]: {
    flexBasis: '50%',
    maxWidth: '50%',
  },
}));

export const SectionCard = styled(Card)(({ theme }) => ({
  height: '100%',
  borderRadius: (theme.shape.borderRadius as any) * 2,
  boxShadow: theme.shadows[2],
}));

export const CardTitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(2),
}));

export const ActionStack = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(2),
  paddingTop: theme.spacing(1),
  flexDirection: 'column',
  [theme.breakpoints.up('sm')]: {
    flexDirection: 'row',
  },
}));

// Inner item layout
export const BakingItemContent = styled(Stack)({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
});

export const BakingItem = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.action.hover,
  borderRadius: theme.shape.borderRadius,
  borderLeft: `4px solid ${theme.palette.secondary.main}`,
}));

export const StatNumber = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  color: theme.palette.secondary.main,
}));

export const BakingListWrapper = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(2),
  marginTop: theme.spacing(2),
}));

// Create a clean wrapper for the text block
export const ItemInfo = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
});

// Create domain-specific Typography
export const ItemName = styled(Typography)(({ theme }) => ({
  variant: 'subtitle1',
  fontWeight: 'bold',
}));

export const ItemSubtext = styled(Typography)(({ theme }) => ({
  variant: 'caption',
  color: theme.palette.text.secondary,
}));