import { styled } from '@mui/material/styles';
import { Paper, Stack, Button, type ButtonProps } from '@mui/material';

export const NavbarPaper = styled(Paper)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  borderRadius: 0,
  position: 'sticky',
  top: 0,
  zIndex: theme.zIndex.appBar,
}));

export const NavStack = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  padding: theme.spacing(1, 2),
  gap: theme.spacing(1),
}));

export const NavButton = styled(Button)<ButtonProps>(({ theme }) => ({
  fontWeight: 600,
  color: theme.palette.text.primary,
  padding: theme.spacing(1, 2),
  '&.active': {
    color: theme.palette.primary.main,
    backgroundColor: theme.palette.action.selected,
  },
})) as typeof Button;

export const LogoutButton = styled(NavButton)(({ theme }) => ({
  marginLeft: 'auto',
  color: theme.palette.error.main,
  '&:hover': {
    backgroundColor: theme.palette.error.light,
    color: theme.palette.error.contrastText,
  },
})) as typeof Button;