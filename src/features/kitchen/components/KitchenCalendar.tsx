import { DayPicker } from 'react-day-picker';
import { es } from 'react-day-picker/locale';
import 'react-day-picker/style.css';
import { Paper } from '@mui/material';

interface Props {
  selectedDate: string;
  datesWithOrders: string[];
  onDateSelect: (date: string) => void;
}

const toLocalDate = (iso: string) => {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const KitchenCalendar = ({ selectedDate, datesWithOrders, onDateSelect }: Props) => {
  const selected = toLocalDate(selectedDate);
  const withOrders = datesWithOrders.map(toLocalDate);

  return (
    <Paper elevation={3} sx={{ display: 'inline-block', p: 1, mb: 2, borderRadius: 2 }}>
      <DayPicker
        locale={es}
        mode="single"
        selected={selected}
        onSelect={(day) => {
          if (day) {
            const iso = [
              day.getFullYear(),
              String(day.getMonth() + 1).padStart(2, '0'),
              String(day.getDate()).padStart(2, '0'),
            ].join('-');
            onDateSelect(iso);
          }
        }}
        modifiers={{ hasOrders: withOrders }}
        modifiersStyles={{
          hasOrders: { fontWeight: 700, textDecoration: 'underline' },
        }}
      />
    </Paper>
  );
};
