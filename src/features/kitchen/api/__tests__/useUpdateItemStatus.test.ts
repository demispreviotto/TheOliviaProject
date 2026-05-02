import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import type { OrderItemStatus } from '../../../order/api/order.types';

// ─── Supabase mock ────────────────────────────────────────────────────────────

// Mutable state that each test configures via helpers below
const mockState = vi.hoisted(() => ({
  orderItemsAfterUpdate: [] as Array<{ order_item_status: string }>,
  orderUpdateCalls: [] as Array<{ orderId: string; payload: { order_status: string } }>,
  itemsUpdateError: null as null | { message: string },
}));

vi.mock('../../../../api/supabase', () => ({
  supabase: {
    from: vi.fn((table: string) => {
      if (table === 'order_items') {
        return {
          update: vi.fn(() => ({
            in: vi.fn().mockResolvedValue({
              error: mockState.itemsUpdateError,
            }),
          })),
          select: vi.fn(() => ({
            eq: vi.fn().mockResolvedValue({
              data: mockState.orderItemsAfterUpdate,
              error: null,
            }),
          })),
        };
      }

      if (table === 'orders') {
        return {
          update: vi.fn((payload: { order_status: string }) => ({
            eq: vi.fn((col: string, val: string) => {
              if (col === 'id') {
                return {
                  not: vi.fn().mockImplementation(() => {
                    mockState.orderUpdateCalls.push({ orderId: val, payload });
                    return Promise.resolve({ error: null });
                  }),
                };
              }
              return { not: vi.fn().mockResolvedValue({ error: null }) };
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

const setItemStatesAfterUpdate = (statuses: OrderItemStatus[]) => {
  mockState.orderItemsAfterUpdate = statuses.map((s) => ({ order_item_status: s }));
};

beforeEach(() => {
  mockState.orderItemsAfterUpdate = [];
  mockState.orderUpdateCalls = [];
  mockState.itemsUpdateError = null;
});

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('useUpdateItemStatus — sincronización order_status', () => {
  describe('Transición: ítem → cooking fuerza order → cooking', () => {
    it('actualiza order_status a "cooking" cuando quedan ítems en cooking y pending', async () => {
      // Escenario: 2 ítems restantes → 1 cooking, 1 pending
      setItemStatesAfterUpdate(['cooking', 'pending']);

      const { useUpdateItemStatus } = await import('../useUpdateItemStatus');
      const { result } = renderHook(() => useUpdateItemStatus(), { wrapper: makeWrapper() });

      await result.current.mutateAsync({
        itemIds: ['item-1'],
        newStatus: 'cooking',
        orderIds: ['order-A'],
        date: '2026-05-10',
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      const orderCall = mockState.orderUpdateCalls.find((c) => c.orderId === 'order-A');
      expect(orderCall?.payload.order_status).toBe('cooking');
    });

    it('actualiza order_status a "cooking" cuando todos los ítems están cooking', async () => {
      setItemStatesAfterUpdate(['cooking', 'cooking', 'cooking']);

      const { useUpdateItemStatus } = await import('../useUpdateItemStatus');
      const { result } = renderHook(() => useUpdateItemStatus(), { wrapper: makeWrapper() });

      await result.current.mutateAsync({
        itemIds: ['item-1', 'item-2'],
        newStatus: 'cooking',
        orderIds: ['order-B'],
        date: '2026-05-10',
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      const orderCall = mockState.orderUpdateCalls.find((c) => c.orderId === 'order-B');
      expect(orderCall?.payload.order_status).toBe('cooking');
    });
  });

  describe('Cierre: 100% ítems ready → order → ready', () => {
    it('actualiza order_status a "ready" cuando TODOS los ítems están "ready"', async () => {
      setItemStatesAfterUpdate(['ready', 'ready', 'ready']);

      const { useUpdateItemStatus } = await import('../useUpdateItemStatus');
      const { result } = renderHook(() => useUpdateItemStatus(), { wrapper: makeWrapper() });

      await result.current.mutateAsync({
        itemIds: ['item-3'],
        newStatus: 'ready',
        orderIds: ['order-C'],
        date: '2026-05-10',
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      const orderCall = mockState.orderUpdateCalls.find((c) => c.orderId === 'order-C');
      expect(orderCall?.payload.order_status).toBe('ready');
    });

    it('NO actualiza la orden a "ready" si hay un ítem cooking', async () => {
      // 2 ready, 1 cooking → todavía NO debe cerrar
      setItemStatesAfterUpdate(['ready', 'ready', 'cooking']);

      const { useUpdateItemStatus } = await import('../useUpdateItemStatus');
      const { result } = renderHook(() => useUpdateItemStatus(), { wrapper: makeWrapper() });

      await result.current.mutateAsync({
        itemIds: ['item-4'],
        newStatus: 'ready',
        orderIds: ['order-D'],
        date: '2026-05-10',
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      const orderCall = mockState.orderUpdateCalls.find((c) => c.orderId === 'order-D');
      // Debe haber actualizado a 'cooking', no a 'ready'
      expect(orderCall?.payload.order_status).toBe('cooking');
      expect(orderCall?.payload.order_status).not.toBe('ready');
    });

    it('NO actualiza la orden si todos los ítems siguen en pending', async () => {
      setItemStatesAfterUpdate(['pending', 'pending']);

      const { useUpdateItemStatus } = await import('../useUpdateItemStatus');
      const { result } = renderHook(() => useUpdateItemStatus(), { wrapper: makeWrapper() });

      await result.current.mutateAsync({
        itemIds: ['item-5'],
        newStatus: 'pending',
        orderIds: ['order-E'],
        date: '2026-05-10',
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      const orderCall = mockState.orderUpdateCalls.find((c) => c.orderId === 'order-E');
      // calculateNewOrderStatus(['pending','pending']) → null → no se llama update en orders
      expect(orderCall).toBeUndefined();
    });
  });

  describe('Multi-orden: sincroniza todas las órdenes afectadas', () => {
    it('sincroniza cada orderId de forma independiente', async () => {
      // Ambas órdenes tienen todos sus ítems ready
      setItemStatesAfterUpdate(['ready', 'ready']);

      const { useUpdateItemStatus } = await import('../useUpdateItemStatus');
      const { result } = renderHook(() => useUpdateItemStatus(), { wrapper: makeWrapper() });

      await result.current.mutateAsync({
        itemIds: ['item-6', 'item-7'],
        newStatus: 'ready',
        orderIds: ['order-F', 'order-G'],
        date: '2026-05-10',
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      const calledOrderIds = mockState.orderUpdateCalls.map((c) => c.orderId);
      expect(calledOrderIds).toContain('order-F');
      expect(calledOrderIds).toContain('order-G');
    });
  });
});
