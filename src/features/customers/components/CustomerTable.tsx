// src/features/customers/components/CustomerTable.tsx
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TableSortLabel, Paper, Chip
} from '@mui/material';
import type { Customer } from '../api/customer.types';
import { CATEGORY_LABELS } from '../utils/customerMappings';
import { EmptyState } from '../../../components/ui/EmptyState';
import { useTableSort } from '../../../utils/useTableSort';

type CustomerSortKey = 'name' | 'category';

const getCustomerValue = (customer: Customer, key: CustomerSortKey): string | null => {
  switch (key) {
    case 'name':     return customer.full_name || customer.company_name || null;
    case 'category': return customer.category;
  }
};

interface Props {
  customers: Customer[];
  onView: (customer: Customer) => void;
}

export const CustomerTable = ({ customers, onView }: Props) => {
  const { sorted, sortKey, sortDir, handleSort } = useTableSort<Customer, CustomerSortKey>(customers, getCustomerValue);

  if (sorted.length === 0) return <EmptyState message="Todavía no hay clientes cargados." />;

  return (
    <TableContainer component={Paper} elevation={2}>
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: 'action.hover' }}>
            <TableCell sx={{ fontWeight: 'bold' }} sortDirection={sortKey === 'name' ? sortDir : false}>
              <TableSortLabel
                active={sortKey === 'name'}
                direction={sortKey === 'name' ? sortDir : 'asc'}
                onClick={() => handleSort('name')}
              >
                Nombre / Razón Social
              </TableSortLabel>
            </TableCell>
            <TableCell sx={{ fontWeight: 'bold' }} sortDirection={sortKey === 'category' ? sortDir : false}>
              <TableSortLabel
                active={sortKey === 'category'}
                direction={sortKey === 'category' ? sortDir : 'asc'}
                onClick={() => handleSort('category')}
              >
                Categoría
              </TableSortLabel>
            </TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Contacto</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Dirección</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sorted.map((customer) => (
            <TableRow
              key={customer.id}
              hover
              onClick={() => onView(customer)}
              sx={{ cursor: 'pointer' }}
            >
              <TableCell>{customer.full_name || customer.company_name}</TableCell>
              <TableCell>
                <Chip
                  label={CATEGORY_LABELS[customer.category]}
                  color={customer.category === 'wholesale' ? 'secondary' : 'default'}
                  size="small"
                />
              </TableCell>
              <TableCell>
                {customer.phone && <div>{customer.phone}</div>}
                {customer.email && <div style={{ fontSize: '0.8rem', color: 'gray' }}>{customer.email}</div>}
              </TableCell>
              <TableCell>{customer.delivery_address}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
