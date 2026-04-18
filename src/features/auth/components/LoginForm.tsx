import { useState } from 'react';
import { TextField, Button, Typography, Alert } from '@mui/material';
import * as S from './LoginForm.styles';
import { supabase } from '../../../api/supabase';

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // Added password state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: authError } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
    }
    // Success will be automatically caught by the store listener!
  };

  return (
    <S.FormContainer elevation={3}>
      <Typography variant="h5" gutterBottom align="center">Bakery Login</Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <S.FormWrapper onSubmit={handleLogin}>
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          fullWidth
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          fullWidth
          sx={{ mt: 2 }}
        />
        <Button 
          type="submit" 
          variant="contained" 
          disabled={loading}
          fullWidth
          sx={{ mt: 3 }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </Button>
      </S.FormWrapper>
    </S.FormContainer>
  );
};