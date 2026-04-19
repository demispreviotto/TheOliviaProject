import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../features/auth/store/useAuthStore';
import { MainNavbar } from '../components/layout/MainNavbar/MainNavbar';
import * as S from './ProtectedLayout.styles';

export const ProtectedLayout = () => {
  const isAuth = useAuthStore((s) => s.isAuthenticated);

  if (!isAuth) return <Navigate to="/login" replace />;

  return (
    <S.LayoutRoot>
      <MainNavbar />
      <S.PageContainer component="main">
        <Outlet />
      </S.PageContainer>
    </S.LayoutRoot>
  );
};