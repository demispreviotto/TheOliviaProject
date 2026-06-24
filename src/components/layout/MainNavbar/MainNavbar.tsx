import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Box, IconButton, Drawer, List, ListItemIcon, ListItemText, Divider,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import PeopleAltIcon from '@mui/icons-material/PeopleOutlined';
import BreakfastDiningOutlinedIcon from '@mui/icons-material/BreakfastDiningOutlined';
import StorefrontIcon from '@mui/icons-material/Storefront';
import AssignmentIcon from '@mui/icons-material/AssignmentOutlined';
import HistoryIcon from '@mui/icons-material/History';
import BarChartIcon from '@mui/icons-material/BarChart';
import { useAuthStore } from '../../../features/auth/store/useAuthStore';
import { useQueryClient } from '@tanstack/react-query';
import * as S from './MainNavbar.styles';

interface NavItem {
  to: string;
  label: string;
  Icon: React.ElementType;
  end?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/',          label: 'Inicio',    Icon: StorefrontIcon,                end: true },
  { to: '/clientes',  label: 'Clientes',  Icon: PeopleAltIcon },
  { to: '/productos', label: 'Productos', Icon: BreakfastDiningOutlinedIcon },
  { to: '/pedidos',   label: 'Pedidos',   Icon: AssignmentIcon },
  { to: '/cocina',    label: 'Cocina',    Icon: HistoryIcon },
  { to: '/reporte',   label: 'Reporte',   Icon: BarChartIcon },
];

const DRAWER_WIDTH = 240;

export const MainNavbar = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const logout = useAuthStore((s) => s.logout);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    queryClient.clear();
    navigate('/login');
  };

  const closeDrawer = () => setDrawerOpen(false);

  return (
    <S.NavbarPaper elevation={0}>
      {/* Desktop nav — hidden on mobile */}
      <S.NavStack sx={{ display: { xs: 'none', md: 'flex' } }}>
        {NAV_ITEMS.map(({ to, label, Icon, end }) => (
          <S.NavButton key={to} component={NavLink} to={to} end={end}>
            <Icon fontSize="small" />
            {label}
          </S.NavButton>
        ))}
        <S.LogoutButton startIcon={<LogoutIcon />} onClick={handleLogout}>
          Salir
        </S.LogoutButton>
      </S.NavStack>

      {/* Mobile bar — hidden on desktop */}
      <Box
        sx={{
          display: { xs: 'flex', md: 'none' },
          alignItems: 'center',
          px: 2,
          py: 1,
        }}
      >
        <IconButton
          edge="start"
          onClick={() => setDrawerOpen(true)}
          aria-label="Abrir menú"
          color="primary"
        >
          <MenuIcon />
        </IconButton>
      </Box>

      {/* Mobile drawer */}
      <Drawer anchor="left" open={drawerOpen} onClose={closeDrawer}>
        <Box sx={{ width: DRAWER_WIDTH, pt: 1 }} role="presentation">
          <List disablePadding>
            {NAV_ITEMS.map(({ to, label, Icon, end }) => (
              <S.DrawerListItem
                key={to}
                component={NavLink}
                to={to}
                end={end}
                onClick={closeDrawer}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <Icon />
                </ListItemIcon>
                <ListItemText primary={label} />
              </S.DrawerListItem>
            ))}
          </List>

          <Divider sx={{ my: 1 }} />

          <List disablePadding>
            <S.DrawerListItem
              onClick={async () => { closeDrawer(); await handleLogout(); }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Salir" />
            </S.DrawerListItem>
          </List>
        </Box>
      </Drawer>
    </S.NavbarPaper>
  );
};
