import { styled } from '@mui/material/styles';
import { Paper, Stack, Button, ListItemButton, type ButtonProps, type ListItemButtonProps } from '@mui/material';

export const NavbarPaper = styled(Paper)(({ theme }) => ({
  position: 'sticky',
  top: 0,
  zIndex: theme.zIndex.appBar,
  borderRadius: 0,
  marginBottom: theme.spacing(3),
  backgroundColor: theme.palette.background.paper,
}));

export const NavStack = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  padding: theme.spacing(1.5, 3),
  gap: theme.spacing(1),
}));

export const NavButton = styled(Button)<ButtonProps>(({ theme }) => ({
  fontWeight: 500,
  fontSize: '0.875rem',
  letterSpacing: '0.1px',
  textTransform: 'none',
  borderRadius: '100px',
  padding: theme.spacing(1, 2.5),
  color: theme.palette.primary.main,
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  transition: theme.transitions.create(['background-color', 'color']),

  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    color: theme.palette.text.primary,
  },

  '&.active': {
    color: theme.palette.primary.main,
    fontWeight: 600,
    backgroundColor: theme.palette.action.selected,
  },

  '& svg': {
    color: theme.palette.primary.main,
  },
})) as typeof Button;

export const LogoutButton = styled(NavButton)(({ theme }) => ({
  marginLeft: 'auto',
  fontWeight: 500,
  textTransform: 'none',
  borderRadius: '100px',
  padding: theme.spacing(1, 2.5),
  display: 'flex',
  alignItems: 'center',
  gap: '8px',

  '&:hover': {
    backgroundColor: 'rgba(211, 47, 47, 0.08)',
  },
})) as typeof Button;

export const DrawerListItem = styled(ListItemButton)<ListItemButtonProps>(({ theme }) => ({
  borderRadius: '24px',
  margin: theme.spacing(0.25, 1),
  gap: theme.spacing(1),
  transition: theme.transitions.create(['background-color', 'color']),

  '&.active': {
    backgroundColor: theme.palette.action.selected,
    color: theme.palette.primary.main,
    fontWeight: 600,
    '& svg': {
      color: theme.palette.primary.main,
    },
  },

  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
})) as typeof ListItemButton;
