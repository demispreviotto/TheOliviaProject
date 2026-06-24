import { Grid, Stack } from '@mui/material';
import { useAuthStore } from '../auth/store/useAuthStore';
import { MonthlyKpiBar } from '../report/components/MonthlyKpiBar';
import { TodayDeliveriesCard } from './components/TodayDeliveriesCard';
import { KitchenStatusCard } from './components/KitchenStatusCard';
import * as S from './HomePage.styles';

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

      <Stack spacing={2}>
        <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
          <Grid size={{ xs: 12, md: 7 }}>
            <TodayDeliveriesCard />
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <KitchenStatusCard />
          </Grid>
        </Grid>

        <MonthlyKpiBar />
      </Stack>
    </S.HomeContainer>
  );
};
