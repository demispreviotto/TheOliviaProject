import { Box, Typography } from '@mui/material';
import InboxIcon from '@mui/icons-material/Inbox';

interface EmptyStateProps {
  message?: string;
}

export const EmptyState = ({ message = 'No hay registros para mostrar.' }: EmptyStateProps) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      py: 8,
      gap: 1,
      color: 'text.disabled',
    }}
  >
    <InboxIcon sx={{ fontSize: 48 }} />
    <Typography variant="body1">{message}</Typography>
  </Box>
);
