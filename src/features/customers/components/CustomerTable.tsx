// src/features/customers/components/CustomerTable.tsx
import { Chip } from '@mui/material';
import type { Customer } from '../api/customer.types';
import { CATEGORY_LABELS } from '../utils/customerMappings';
import { DataTable, type DataTableColumn } from '../../../components/ui/DataTable';
import { useTableSort } from '../../../utils/useTableSort';

type CustomerSortKey = 'name' | 'category';

const getCustomerValue = (customer: Customer, key: CustomerSortKey): string | null => {
  switch (key) {
    case 'name':     return customer.full_name;
    case 'category': return customer.category;
  }
};

const columns: DataTableColumn<Customer, CustomerSortKey>[] = [
  {
    id: 'name', label: 'Nombre / Razón Social', sortKey: 'name',
    render: (customer) => customer.full_name,
  },
  {
    id: 'category', label: 'Categoría', sortKey: 'category',
    render: (customer) => (
      <Chip
        label={CATEGORY_LABELS[customer.category]}
        color={customer.category === 'wholesale' ? 'secondary' : 'default'}
        size="small"
      />
    ),
  },
  {
    id: 'contact', label: 'Contacto',
    render: (customer) => (
      <>
        {customer.phone && <div>{customer.phone}</div>}
        {customer.email && <div style={{ fontSize: '0.8rem', color: 'gray' }}>{customer.email}</div>}
      </>
    ),
  },
  {
    id: 'address', label: 'Dirección',
    render: (customer) => customer.delivery_address,
  },
];

interface Props {
  customers: Customer[];
  onView: (customer: Customer) => void;
}

export const CustomerTable = ({ customers, onView }: Props) => {
  const { sorted, sortKey, sortDir, handleSort } = useTableSort<Customer, CustomerSortKey>(customers, getCustomerValue);

  return (
    <DataTable
      columns={columns}
      rows={sorted}
      getRowKey={(customer) => customer.id}
      onRowClick={onView}
      sort={{ sortKey, sortDir, onSort: handleSort }}
      emptyMessage="Todavía no hay clientes cargados."
    />
  );
};
