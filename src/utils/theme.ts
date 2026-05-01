import { createTheme } from '@mui/material/styles';
import m3Theme from './material-theme.json';
const { light } = m3Theme.schemes;

export const theme = createTheme({
palette: {
    mode: 'light',
    primary: {
      main: light.primary,
      contrastText: light.onPrimary,
    },
    secondary: {
      main: light.secondary,
      contrastText: light.onSecondary,
    },
    error: {
      main: light.error,
      contrastText: light.onError,
    },
    background: {
      default: light.background,
      paper: light.surfaceVariant,
    },
    text: {
      primary: light.onSurface,
      secondary: light.onSurfaceVariant,
    },
  },
 
  shape: {
    borderRadius: 16, 
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 100,
          textTransform: 'none',
          padding: '10px 24px',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: light.surfaceContainerLow,
        },
      },
    },
  },
});
