import { Container } from '@mui/material';
import { LoginForm } from './components/LoginForm';
import * as S from './LoginPage.styles';

export const LoginPage = () => {
  return (
    <S.PageContainer >
      <Container maxWidth="xs">
        <LoginForm />
      </Container>
    </S.PageContainer>
  );
};