import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';

// ─── Supabase mock ────────────────────────────────────────────────────────────

const cascadeSpy = vi.hoisted(() =>
  vi.fn().mockResolvedValue({ error: null }),
);

vi.mock('../../../../api/supabase', () => ({
  supabase: {
    from: vi.fn((table: string) => {
      if (table === 'orders') {
        return {
          update: vi.fn(() => ({
            eq: vi.fn(() => ({
              select: vi.fn(() => ({
                single: vi.fn().mockResolvedValue({
                  data: { id: 'order-1', order_status: 'cooking' },
                  error: null,
                }),
              })),
            })),
          })),
        };
      }

      if (table === 'order_items') {
        return {
          delete: vi.fn(() => ({
            eq: vi.fn().mockResolvedValue({ error: null }),
          })),
          insert: vi.fn().mockResolvedValue({ error: null }),
          update: vi.fn(() => ({
            eq: vi.fn((col: string) => {
              if (col === 'order_id') {
                // This is the cascade update: items → cooking
                return {
                  eq: vi.fn().mockImplementation(cascadeSpy),
                };
              }
              return { eq: vi.fn().mockResolvedValue({ error: null }) };
            }),
          })),
        };
      }

      return {};
    }),
  },
}));

// ─── Helpers ─────────────────────────────────────────────────────────────────

const makeWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
};

beforeEach(() => {
  cascadeSpy.mockClear();
});

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('useUpdateOrder — cascada order_status → order_item_status', () => {
  it('cascada: cuando order_status pasa a "cooking", los ítems pending se actualizan a "cooking"', async () => {
    const { useUpdateOrder } = await import('../useUpdateOrder');
    const { result } = renderHook(() => useUpdateOrder(), { wrapper: makeWrapper() });

    await result.current.mutateAsync({
      id: 'order-1',
      order_status: 'cooking',
      order_items: [
        { product_id: 'p1', quantity: 2, unit_price: 100, discount_amount: 0 },
      ],
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // La cascada debe haber llamado update con order_item_status = 'cooking'
    // y filtrado solo los 'pending'
    expect(cascadeSpy).toHaveBeenCalled();
  });

  it('sin cascada: cuando order_status NO es "cooking", los ítems NO se tocan', async () => {
    const { useUpdateOrder } = await import('../useUpdateOrder');
    const { result } = renderHook(() => useUpdateOrder(), { wrapper: makeWrapper() });

    await result.current.mutateAsync({
      id: 'order-2',
      order_status: 'pending',
      order_items: [
        { product_id: 'p1', quantity: 1, unit_price: 50, discount_amount: 0 },
      ],
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // No debe haber cascada
    expect(cascadeSpy).not.toHaveBeenCalled();
  });
});
