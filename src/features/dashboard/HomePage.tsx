// import { CardContent, Button, } from '@mui/material';
// import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
// import BakeryDiningIcon from '@mui/icons-material/BakeryDining';
// import PeopleIcon from '@mui/icons-material/People';
import { useAuthStore } from '../auth/store/useAuthStore';
import * as S from './HomePage.styles';

// const mockBakingList = [
//   { name: 'Budín de Pera', quantity: 12, presentation: 'Grande 500g' },
//   { name: 'Pepas de Membrillo', quantity: 24, presentation: 'Bolsa x 12' },
// ];

export const HomePage = () => {
  const user = useAuthStore((s) => s.user);
  const userName = user?.user_metadata?.full_name || 'Admin';

  return (
    <S.HomeContainer>
      <S.HeaderStack>
        <S.WelcomeTitle variant="h4">
          ¡Hola, {userName}!
        </S.WelcomeTitle>
      </S.HeaderStack>

      {/* <S.DashboardGridContainer>
        <S.GridItemFull>
          <S.SectionCard>
            <CardContent>
              <S.CardTitle variant="h6">Acciones Rápidas</S.CardTitle>
              <S.ActionStack>
                <Button variant="contained" size="large" startIcon={<AddCircleOutlineOutlinedIcon/>} fullWidth>
                  Nuevo Pedido
                </Button>
                <Button variant="outlined" size="large" startIcon={<PeopleIcon />} fullWidth>
                  Clientes
                </Button>
                <Button variant="outlined" size="large" startIcon={<BakeryDiningIcon />} fullWidth>
                  Productos
                </Button>
              </S.ActionStack>
            </CardContent>
          </S.SectionCard>
        </S.GridItemFull> */}

      {/* <S.GridItemHalf>
          <S.SectionCard>
            <CardContent>
              <S.CardTitle variant="h6">📋 Lista de Horneo (Hoy)</S.CardTitle>
                <S.BakingListWrapper>
                {mockBakingList.map((item, idx) => (
                    <S.BakingItem key={idx}>
                    <S.BakingItemContent>
                        
                        <S.ItemInfo>
                        <S.ItemName variant="subtitle1">
                            {item.name}
                        </S.ItemName>
                        <S.ItemSubtext variant="caption">
                            {item.presentation}
                        </S.ItemSubtext>
                        </S.ItemInfo>

                        <S.StatNumber variant="h4">
                        x{item.quantity}
                        </S.StatNumber>
                        
                    </S.BakingItemContent>
                    </S.BakingItem>
                ))}
                </S.BakingListWrapper>
            </CardContent>
          </S.SectionCard>
        </S.GridItemHalf>
      </S.DashboardGridContainer> */}
    </S.HomeContainer>
  );
};