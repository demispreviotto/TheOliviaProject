import { useEffect, useState } from 'react';
import { ThemeProvider, CssBaseline, Button, Stack } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import { theme } from './utils/theme';
import { supabase } from './api/supabase';
import { useAuthStore } from './features/auth/store/useAuthStore';
import { CustomersPage } from './features/customers/CustomersPage';
import { ProductsPage } from './features/products/ProductsPage';
import * as S from './App.styles';

function App() {
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    // 1. Initial Session Check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // 2. Listen for Auth Changes (Login/Logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [setUser]);

  const [currentPage, setCurrentPage] = useState<'customers' | 'products'>('customers');

  return (
    <ThemeProvider theme={theme}>
      <SnackbarProvider maxSnack={3} autoHideDuration={3000}>
        <CssBaseline />
        
        <S.LayoutWrapper>
          <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
            <Button 
              variant={currentPage === 'customers' ? 'contained' : 'outlined'} 
              onClick={() => setCurrentPage('customers')}
            >
              Clientes
            </Button>
            <Button 
              variant={currentPage === 'products' ? 'contained' : 'outlined'} 
              onClick={() => setCurrentPage('products')}
            >
              Productos
            </Button>
          </Stack>

          {currentPage === 'customers' ? <CustomersPage /> : <ProductsPage />}
        </S.LayoutWrapper>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;