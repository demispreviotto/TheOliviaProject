import { NavLink, useNavigate } from 'react-router-dom';
import * as S from './MainNavbar.styles';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuthStore } from '../../../features/auth/store/useAuthStore';
import { useQueryClient } from '@tanstack/react-query';

export const MainNavbar = () => {
  const logout = useAuthStore((s) => s.logout);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    queryClient.clear(); // Wipes all cached customers/products
    navigate('/login');
  };

  return (
    <S.NavbarPaper elevation={1}>
      <S.NavStack>
        <S.NavButton 
          component={NavLink} 
          to="/" 
          end
        >
          Inicio
        </S.NavButton>
        <S.NavButton 
          component={NavLink} 
          to="/clientes"
        >
          Clientes
        </S.NavButton>
        <S.NavButton 
          component={NavLink} 
          to="/productos"
        >
          Productos
        </S.NavButton>
        <S.LogoutButton 
          startIcon={<LogoutIcon />} 
          onClick={handleLogout}
        >
          Salir
        </S.LogoutButton>
      </S.NavStack>
    </S.NavbarPaper>
  );
};