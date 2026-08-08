// src/components/ui/DataTable.tsx
import type { ReactNode } from 'react';
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TableSortLabel, Paper,
} from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import { EmptyState } from './EmptyState';
import type { SortDir } from '../../utils/useTableSort';
import * as S from './DataTable.styles';

export interface DataTableColumn<T, K extends string = string> {
  id: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  sortKey?: K;
  sx?: SxProps<Theme>;
  render: (row: T) => ReactNode;
}

export interface DataTableSort<K extends string> {
  sortKey: K | null;
  sortDir: SortDir;
  onSort: (key: K) => void;
}

interface DataTableProps<T, K extends string = string> {
  columns: DataTableColumn<T, K>[];
  rows: T[];
  getRowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  sort?: DataTableSort<K>;
  emptyMessage?: string;
  size?: 'small' | 'medium';
  footer?: ReactNode;
}

export function DataTable<T, K extends string = string>({
  columns, rows, getRowKey, onRowClick, sort, emptyMessage, size = 'medium', footer,
}: DataTableProps<T, K>) {
  if (rows.length === 0) return <EmptyState message={emptyMessage} />;

  return (
    <TableContainer component={Paper} elevation={2}>
      <Table size={size}>
        <TableHead>
          <S.HeaderRow>
            {columns.map((col) => (
              <TableCell
                key={col.id}
                align={col.align}
                sortDirection={sort && col.sortKey && sort.sortKey === col.sortKey ? sort.sortDir : false}
              >
                {col.sortKey && sort ? (
                  <TableSortLabel
                    active={sort.sortKey === col.sortKey}
                    direction={sort.sortKey === col.sortKey ? sort.sortDir : 'asc'}
                    onClick={() => sort.onSort(col.sortKey as K)}
                  >
                    {col.label}
                  </TableSortLabel>
                ) : col.label}
              </TableCell>
            ))}
          </S.HeaderRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={getRowKey(row)}
              hover={!!onRowClick}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              sx={onRowClick ? { cursor: 'pointer' } : undefined}
            >
              {columns.map((col) => (
                <TableCell key={col.id} align={col.align} sx={col.sx}>
                  {col.render(row)}
                </TableCell>
              ))}
            </TableRow>
          ))}
          {footer}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
