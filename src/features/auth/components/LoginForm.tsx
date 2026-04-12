import { useState } from 'react';
import { TextField, Button, Typography } from '@mui/material';
import * as S from './LoginForm.styles';
import { supabase } from '../../../api/supabase';

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) alert(error.message);
    else alert('Check your email for the login link!');
    setLoading(false);
  };

  return (
    <S.FormContainer elevation={3}>
      <Typography variant="h5" gutterBottom>Login</Typography>
      <S.FormWrapper onSubmit={handleLogin}>
        <TextField
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          fullWidth
        />
        <Button 
          type="submit" 
          variant="contained" 
          disabled={loading}
          fullWidth
        >
          {loading ? 'Sending...' : 'Send Magic Link'}
        </Button>
      </S.FormWrapper>
    </S.FormContainer>
  );
};