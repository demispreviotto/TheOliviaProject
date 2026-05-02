import { Fab, Tooltip, CircularProgress } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';

interface Props {
  count: number;
  isLoading: boolean;
  onClick: () => void;
}

export const KitchenFAB = ({ count, isLoading, onClick }: Props) => {
  if (count === 0) return null;

  return (
    <Tooltip title={`Marcar ${count} como Listos`} placement="left">
      <Fab
        color="success"
        onClick={onClick}
        disabled={isLoading}
        sx={{
          position: 'fixed',
          bottom: { xs: 24, sm: 32 },
          right: { xs: 16, sm: 32 },
          zIndex: 1200,
          width: 64,
          height: 64,
        }}
      >
        {isLoading ? <CircularProgress size={28} color="inherit" /> : <CheckIcon fontSize="large" />}
      </Fab>
    </Tooltip>
  );
};
