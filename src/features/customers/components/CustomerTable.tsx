// src/features/customers/components/CustomerTable.tsx
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Chip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import type { Customer } from '../api/customer.types';
import { EmptyState } from '../../../components/ui/EmptyState';

interface Props {
  customers: Customer[];
  onEdit: (customer: Customer) => void;
  onView: (customer: Customer) => void;
}

export const CustomerTable = ({ customers, onEdit, onView }: Props) => {
  if (customers.length === 0) return <EmptyState message="Todavía no hay clientes cargados." />;

  return (
    <TableContainer component={Paper} elevation={2}>
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: 'action.hover' }}>
            <TableCell sx={{ fontWeight: 'bold' }}>Nombre / Razón Social</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Categoría</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Contacto</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Dirección</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer.id} hover>
              <TableCell>
                {customer.full_name}
              </TableCell>
              <TableCell>
                <Chip 
                  label={customer.category === 'wholesale' ? 'Mayorista' : 'Individual'} 
                  color={customer.category === 'wholesale' ? 'secondary' : 'default'}
                  size="small"
                />
              </TableCell>
              <TableCell>
                {customer.phone && <div>{customer.phone}</div>}
                {customer.email && <div style={{ fontSize: '0.8rem', color: 'gray' }}>{customer.email}</div>}
              </TableCell>
              <TableCell>{customer.delivery_address}</TableCell>
              <TableCell align="right">
                <IconButton onClick={() => onView(customer)} color="primary" size="small">
                  <VisibilityIcon />
                </IconButton>
                <IconButton onClick={() => onEdit(customer)} color="primary" size="small">
                  <EditIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};