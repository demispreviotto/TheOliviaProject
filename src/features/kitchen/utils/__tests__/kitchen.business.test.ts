import { describe, it, expect } from 'vitest';
import { calculateNewOrderStatus, computeFabData } from '../kitchen.business';
import type { KitchenCategory } from '../../api/kitchen.types';
import type { OrderItemStatus } from '../../../order/api/order.types';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const makeCategory = (
  groups: Array<{ key: string; items: Array<{ id: string; status: OrderItemStatus }> }>,
): KitchenCategory => ({
  category: 'pepas',
  totalQuantity: groups.flatMap((g) => g.items).length,
  groups: groups.map((g) => ({
    key: g.key,
    productName: `Producto ${g.key}`,
    presentation: 'x12',
    totalQuantity: g.items.length,
    items: g.items.map((i) => ({
      id: i.id,
      orderId: `order-${i.id}`,
      quantity: 1,
      status: i.status,
      notes: null,
    })),
  })),
});

// ─────────────────────────────────────────────────────────────────────────────
// calculateNewOrderStatus
// ─────────────────────────────────────────────────────────────────────────────

describe('calculateNewOrderStatus', () => {
  // CIERRE AUTOMÁTICO
  describe('cierre automático (→ ready)', () => {
    it('retorna "ready" cuando todos los ítems están "ready"', () => {
      expect(calculateNewOrderStatus(['ready', 'ready', 'ready'])).toBe('ready');
    });

    it('retorna "ready" con un solo ítem en "ready"', () => {
      expect(calculateNewOrderStatus(['ready'])).toBe('ready');
    });

    it('NO retorna "ready" si hay UN SOLO ítem que no está "ready"', () => {
      expect(calculateNewOrderStatus(['ready', 'ready', 'pending'])).not.toBe('ready');
      expect(calculateNewOrderStatus(['ready', 'ready', 'cooking'])).not.toBe('ready');
    });
  });

  // TRANSICIÓN A COOKING
  describe('transición order → cooking', () => {
    it('retorna "cooking" cuando al menos un ítem está "cooking"', () => {
      expect(calculateNewOrderStatus(['cooking', 'pending'])).toBe('cooking');
    });

    it('retorna "cooking" cuando todos están "cooking"', () => {
      expect(calculateNewOrderStatus(['cooking', 'cooking'])).toBe('cooking');
    });

    it('retorna "cooking" en mezcla cooking + ready (no 100% listos)', () => {
      expect(calculateNewOrderStatus(['ready', 'cooking', 'ready'])).toBe('cooking');
    });

    it('"cooking" tiene precedencia sobre "ready" parcial', () => {
      expect(calculateNewOrderStatus(['ready', 'cooking'])).toBe('cooking');
    });
  });

  // SIN CAMBIO (null)
  describe('sin cambio de estado (→ null)', () => {
    it('retorna null cuando todos los ítems están "pending"', () => {
      expect(calculateNewOrderStatus(['pending', 'pending'])).toBeNull();
    });

    it('retorna null con un solo ítem "pending"', () => {
      expect(calculateNewOrderStatus(['pending'])).toBeNull();
    });

    it('retorna null con array vacío', () => {
      expect(calculateNewOrderStatus([])).toBeNull();
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// computeFabData — acciones masivas
// ─────────────────────────────────────────────────────────────────────────────

describe('computeFabData', () => {
  // FAB DESHABILITADO
  describe('FAB deshabilitado (targetStatus null)', () => {
    it('retorna null cuando no hay ningún grupo seleccionado', () => {
      const cat = makeCategory([{ key: 'g1', items: [{ id: '1', status: 'pending' }] }]);
      const { targetStatus, items } = computeFabData([cat], new Set());
      expect(targetStatus).toBeNull();
      expect(items).toHaveLength(0);
    });

    it('retorna null con selección MIXTA pending + cooking', () => {
      const cat = makeCategory([
        { key: 'g1', items: [{ id: '1', status: 'pending' }] },
        { key: 'g2', items: [{ id: '2', status: 'cooking' }] },
      ]);
      const { targetStatus } = computeFabData([cat], new Set(['g1', 'g2']));
      expect(targetStatus).toBeNull();
    });

    it('retorna null con selección MIXTA cooking + ready', () => {
      const cat = makeCategory([
        { key: 'g1', items: [{ id: '1', status: 'cooking' }] },
        { key: 'g2', items: [{ id: '2', status: 'ready' }] },
      ]);
      const { targetStatus } = computeFabData([cat], new Set(['g1', 'g2']));
      expect(targetStatus).toBeNull();
    });

    it('retorna null cuando todos los seleccionados ya están "ready" (no hay acción disponible)', () => {
      const cat = makeCategory([{ key: 'g1', items: [{ id: '1', status: 'ready' }] }]);
      const { targetStatus } = computeFabData([cat], new Set(['g1']));
      expect(targetStatus).toBeNull();
    });

    it('retorna null con mezcla pending + ready', () => {
      const cat = makeCategory([
        { key: 'g1', items: [{ id: '1', status: 'pending' }] },
        { key: 'g2', items: [{ id: '2', status: 'ready' }] },
      ]);
      const { targetStatus } = computeFabData([cat], new Set(['g1', 'g2']));
      expect(targetStatus).toBeNull();
    });
  });

  // FAB A COCINA
  describe('FAB homogéneo → "cooking"', () => {
    it('target "cooking" cuando todos los seleccionados son "pending"', () => {
      const cat = makeCategory([
        { key: 'g1', items: [{ id: '1', status: 'pending' }, { id: '2', status: 'pending' }] },
      ]);
      const { targetStatus } = computeFabData([cat], new Set(['g1']));
      expect(targetStatus).toBe('cooking');
    });

    it('target "cooking" con múltiples grupos todos pending', () => {
      const cat = makeCategory([
        { key: 'g1', items: [{ id: '1', status: 'pending' }] },
        { key: 'g2', items: [{ id: '2', status: 'pending' }] },
      ]);
      const { targetStatus } = computeFabData([cat], new Set(['g1', 'g2']));
      expect(targetStatus).toBe('cooking');
    });
  });

  // FAB LISTO
  describe('FAB homogéneo → "ready"', () => {
    it('target "ready" cuando todos los seleccionados son "cooking"', () => {
      const cat = makeCategory([
        { key: 'g1', items: [{ id: '1', status: 'cooking' }, { id: '2', status: 'cooking' }] },
      ]);
      const { targetStatus } = computeFabData([cat], new Set(['g1']));
      expect(targetStatus).toBe('ready');
    });

    it('target "ready" con múltiples grupos todos cooking', () => {
      const cat = makeCategory([
        { key: 'g1', items: [{ id: '1', status: 'cooking' }] },
        { key: 'g2', items: [{ id: '2', status: 'cooking' }] },
      ]);
      const { targetStatus } = computeFabData([cat], new Set(['g1', 'g2']));
      expect(targetStatus).toBe('ready');
    });
  });

  // PRECISIÓN DE SELECCIÓN
  describe('precisión — FAB solo afecta ítems seleccionados', () => {
    it('devuelve únicamente los ítems de los grupos seleccionados, no todos', () => {
      const cat = makeCategory([
        { key: 'g1', items: [{ id: '1', status: 'cooking' }, { id: '2', status: 'cooking' }] },
        { key: 'g2', items: [{ id: '3', status: 'cooking' }] },
      ]);
      // Solo selecciono g1 — el ítem 3 del g2 NO debe incluirse
      const { targetStatus, items } = computeFabData([cat], new Set(['g1']));
      expect(targetStatus).toBe('ready');
      expect(items.map((i) => i.id)).toEqual(['1', '2']);
      expect(items.map((i) => i.id)).not.toContain('3');
    });

    it('preserva los orderIds correctos de los ítems seleccionados', () => {
      const cat = makeCategory([
        { key: 'g1', items: [{ id: 'item-A', status: 'pending' }] },
      ]);
      const { items } = computeFabData([cat], new Set(['g1']));
      expect(items[0].orderId).toBe('order-item-A');
    });
  });
});
