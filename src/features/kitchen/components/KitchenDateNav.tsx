import { IconButton, Button, Typography, Stack } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { useSwipeable } from 'react-swipeable';

interface Props {
  date: string;
  dates: string[];
  onDateChange: (date: string) => void;
  onCalendarToggle: () => void;
}

const formatDate = (iso: string) => {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
};

const today = () => new Date().toISOString().split('T')[0];

export const KitchenDateNav = ({ date, dates, onDateChange, onCalendarToggle }: Props) => {
  const idx = dates.indexOf(date);
  const hasPrev = idx > 0;
  const hasNext = idx < dates.length - 1 && idx !== -1;

  const goPrev = () => { if (hasPrev) onDateChange(dates[idx - 1]); };
  const goNext = () => { if (hasNext) onDateChange(dates[idx + 1]); };

  const handlers = useSwipeable({
    onSwipedLeft: goNext,
    onSwipedRight: goPrev,
    trackMouse: false,
  });

  return (
    <Stack
      {...handlers}
      direction="row"
      sx={{ alignItems: 'center', justifyContent: 'space-between', py: 1, userSelect: 'none' }}
    >
      <IconButton onClick={goPrev} disabled={!hasPrev} size="large">
        <ArrowBackIosNewIcon />
      </IconButton>

      <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
        <Typography variant="h6" sx={{ textTransform: 'capitalize', fontWeight: 600 }}>
          {formatDate(date)}
        </Typography>
        <IconButton onClick={onCalendarToggle} size="small" color="primary">
          <CalendarMonthIcon />
        </IconButton>
        {date !== today() && (
          <Button size="small" variant="outlined" onClick={() => onDateChange(today())}>
            Hoy
          </Button>
        )}
      </Stack>

      <IconButton onClick={goNext} disabled={!hasNext} size="large">
        <ArrowForwardIosIcon />
      </IconButton>
    </Stack>
  );
};
