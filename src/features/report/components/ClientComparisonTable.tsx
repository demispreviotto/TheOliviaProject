import { Chip } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import RemoveIcon from '@mui/icons-material/Remove';
import type { ClientReportRow } from '../api/report.types';
import { formatCurrency } from '../../../utils/formatters';
import { CATEGORY_LABELS } from '../../customers/utils/customerMappings';
import { DataTable, type DataTableColumn } from '../../../components/ui/DataTable';
import { useTableSort } from '../../../utils/useTableSort';

interface Props {
  rows: ClientReportRow[];
}

type ClientReportSortKey = 'name' | 'category' | 'total_amount' | 'prev_total_amount' | 'delta';

const getClientReportValue = (row: ClientReportRow, key: ClientReportSortKey): string | number => {
  switch (key) {
    case 'name':              return row.full_name;
    case 'category':          return row.category;
    case 'total_amount':      return row.total_amount;
    case 'prev_total_amount': return row.prev_total_amount;
    case 'delta':             return row.delta;
  }
};

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

const columns: DataTableColumn<ClientReportRow, ClientReportSortKey>[] = [
  { id: 'client', label: 'Cliente', sortKey: 'name', render: (row) => row.full_name },
  {
    id: 'category', label: 'Tipo', sortKey: 'category',
    render: (row) => (
      <Chip
        label={CATEGORY_LABELS[row.category]}
        size="small"
        variant="outlined"
        color={row.category === 'wholesale' ? 'secondary' : 'default'}
      />
    ),
  },
  { id: 'order_count', label: 'Pedidos', align: 'right', render: (row) => row.order_count },
  {
    id: 'total_amount', label: 'Total mes', align: 'right', sortKey: 'total_amount', sx: { fontWeight: 600 },
    render: (row) => formatCurrency(row.total_amount),
  },
  {
    id: 'prev_total_amount', label: 'Mes anterior', align: 'right', sortKey: 'prev_total_amount', sx: { color: 'text.secondary' },
    render: (row) => row.prev_total_amount > 0 ? formatCurrency(row.prev_total_amount) : '—',
  },
  {
    id: 'delta', label: 'Variación', align: 'right', sortKey: 'delta',
    render: (row) => <Delta delta={row.delta} prevAmount={row.prev_total_amount} />,
  },
];

export const ClientComparisonTable = ({ rows }: Props) => {
  const { sorted, sortKey, sortDir, handleSort } = useTableSort<ClientReportRow, ClientReportSortKey>(rows, getClientReportValue);

  return (
    <DataTable
      columns={columns}
      rows={sorted}
      getRowKey={(row) => row.customer_id}
      sort={{ sortKey, sortDir, onSort: handleSort }}
      size="small"
      emptyMessage="Sin pedidos este mes."
    />
  );
};
