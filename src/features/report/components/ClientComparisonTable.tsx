import {
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import RemoveIcon from '@mui/icons-material/Remove';
import type { ClientReportRow } from '../api/report.types';
import { formatCurrency } from '../../../utils/formatters';
import { CATEGORY_LABELS } from '../../customers/utils/customerMappings';

interface Props {
  rows: ClientReportRow[];
}

const Delta = ({ delta, prevAmount }: { delta: number; prevAmount: number }) => {
  if (prevAmount === 0) {
    return <Chip label="NUEVO" size="small" color="info" variant="outlined" />;
  }
  if (delta === 0) {
    return (
      <Chip
        icon={<RemoveIcon fontSize="small" />}
        label="Sin cambio"
        size="small"
        variant="outlined"
      />
    );
  }
  const isUp = delta > 0;
  return (
    <Chip
      icon={isUp ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />}
      label={`${isUp ? '+' : ''}${formatCurrency(delta)}`}
      size="small"
      color={isUp ? 'success' : 'error'}
      variant="outlined"
    />
  );
};

export const ClientComparisonTable = ({ rows }: Props) => (
  <Table size="small">
    <TableHead>
      <TableRow>
        <TableCell>Cliente</TableCell>
        <TableCell>Tipo</TableCell>
        <TableCell align="right">Pedidos</TableCell>
        <TableCell align="right">Total mes</TableCell>
        <TableCell align="right">Mes anterior</TableCell>
        <TableCell align="right">Variación</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {rows.map((row) => (
        <TableRow key={row.customer_id} hover>
          <TableCell>
            {row.full_name}
          </TableCell>
          <TableCell>
            <Chip
              label={CATEGORY_LABELS[row.category]}
              size="small"
              variant="outlined"
              color={row.category === 'wholesale' ? 'secondary' : 'default'}
            />
          </TableCell>
          <TableCell align="right">{row.order_count}</TableCell>
          <TableCell align="right" sx={{ fontWeight: 600 }}>
            {formatCurrency(row.total_amount)}
          </TableCell>
          <TableCell align="right" sx={{ color: 'text.secondary' }}>
            {row.prev_total_amount > 0 ? formatCurrency(row.prev_total_amount) : '—'}
          </TableCell>
          <TableCell align="right">
            <Delta delta={row.delta} prevAmount={row.prev_total_amount} />
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);
