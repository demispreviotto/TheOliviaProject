import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from './utils/theme';
import { useAuthStore } from './features/auth/store/useAuthStore';
import * as S from './App.styles';
import { AppRouter } from './routes';
import { SnackbarProvider } from 'notistack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

function App() {
  const queryClient = new QueryClient();
  const isInitialLoading = useAuthStore((state) => state.isInitialLoading);

  if (isInitialLoading) return null;

  return (
    <QueryClientProvider client={queryClient}>
    <ThemeProvider theme={theme}>
      <SnackbarProvider maxSnack={3} autoHideDuration={3000}>
        <CssBaseline />
        <S.LayoutWrapper>
          <AppRouter />
        </S.LayoutWrapper>
      </SnackbarProvider>
    </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;