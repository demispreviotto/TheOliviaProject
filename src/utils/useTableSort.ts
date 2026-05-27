import { useState, useMemo } from 'react';

export type SortDir = 'asc' | 'desc';

export interface UseTableSortResult<T, K extends string> {
  sorted: T[];
  sortKey: K | null;
  sortDir: SortDir;
  handleSort: (key: K) => void;
}

/**
 * Reusable sort hook for tables. Define getValue at module level (outside the
 * component) so the reference is stable and won't thrash the useMemo.
 *
 * - numbers  → numeric comparison
 * - strings  → localeCompare('es')
 * - ISO date strings sort correctly as strings (YYYY-MM-DD is lexicographic)
 * - null/undefined values are pushed to the bottom regardless of direction
 */
export function useTableSort<T, K extends string>(
  items: T[],
  getValue: (item: T, key: K) => string | number | null | undefined,
): UseTableSortResult<T, K> {
  const [sortKey, setSortKey] = useState<K | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const handleSort = (key: K) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sorted = useMemo(() => {
    if (!sortKey) return items;
    return [...items].sort((a, b) => {
      const av = getValue(a, sortKey);
      const bv = getValue(b, sortKey);

      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;

      const cmp =
        typeof av === 'number' && typeof bv === 'number'
          ? av - bv
          : String(av).localeCompare(String(bv), 'es', { sensitivity: 'base' });

      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [items, sortKey, sortDir, getValue]);

  return { sorted, sortKey, sortDir, handleSort };
}
