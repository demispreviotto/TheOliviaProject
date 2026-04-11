import { useEffect } from 'react';
import { ThemeProvider, CssBaseline, Box, Typography } from '@mui/material';
import { theme } from './utils/theme';
import { supabase } from './api/supabase';
import { useAuthStore } from './features/auth/store/useAuthStore';
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

  return (
    <ThemeProvider theme={theme}>
      {/* CssBaseline kicks out browser defaults and applies MUI's theme reset */}
      <CssBaseline />
      
      <S.LayoutWrapper>
        <Typography variant="h3" component="h1">
          Hello World
        </Typography>
      </S.LayoutWrapper>
    </ThemeProvider>
  );
}

export default App;