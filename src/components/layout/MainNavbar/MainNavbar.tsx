import { NavLink, useNavigate } from 'react-router-dom';
import * as S from './MainNavbar.styles';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuthStore } from '../../../features/auth/store/useAuthStore';
import { useQueryClient } from '@tanstack/react-query';

import PeopleAltIcon from '@mui/icons-material/PeopleOutlined';
import BreakfastDiningOutlinedIcon from '@mui/icons-material/BreakfastDiningOutlined';
import StorefrontIcon from '@mui/icons-material/Storefront';
import AssignmentIcon from '@mui/icons-material/AssignmentOutlined';
import HistoryIcon from '@mui/icons-material/History';

export const MainNavbar = () => {
  const logout = useAuthStore((s) => s.logout);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    queryClient.clear();
    navigate('/login');
  };

  return (
    <S.NavbarPaper elevation={0}>
      <S.NavStack>
        <S.NavButton
          component={NavLink}
          to="/"
          end
        >
          <StorefrontIcon fontSize="small" />
          Inicio
        </S.NavButton>
        <S.NavButton
          component={NavLink}
          to="/clientes"
        >
          <PeopleAltIcon fontSize="small" />
          Clientes
        </S.NavButton>
        <S.NavButton
          component={NavLink}
          to="/productos"
        >
          {/* <InventoryIcon /> */}
          <BreakfastDiningOutlinedIcon fontSize="small" />
          Productos
        </S.NavButton>
        <S.NavButton
          component={NavLink}
          to="/pedidos"
        >
          <AssignmentIcon fontSize="small" />
          Pedidos
        </S.NavButton>
        <S.NavButton
          component={NavLink}
          to="/cocina"
        >
          <HistoryIcon fontSize="small" />
          Cocina
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