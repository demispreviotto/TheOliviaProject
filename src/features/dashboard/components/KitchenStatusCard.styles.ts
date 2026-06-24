import { styled } from '@mui/material/styles';
import { Stack, Typography } from '@mui/material';

export const TitleRow = styled(Stack)({
  flexDirection: 'row',
  alignItems: 'center',
});

export const TitleText = styled(Typography)({
  fontWeight: 600,
}) as typeof Typography;

export const StatusRowRoot = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingTop: theme.spacing(0.75),
  paddingBottom: theme.spacing(0.75),
}));

export const StatusLabel = styled(Stack)({
  flexDirection: 'row',
  alignItems: 'center',
});

export const StatusCount = styled(Typography)({
  fontWeight: 600,
}) as typeof Typography;

export const LoadingWrapper = styled(Stack)(({ theme }) => ({
  alignItems: 'center',
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(3),
}));

export const ActionRow = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  marginTop: theme.spacing(2),
}));
