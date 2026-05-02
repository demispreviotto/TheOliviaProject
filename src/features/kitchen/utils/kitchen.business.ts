import type { KitchenCategory, KitchenRawItem } from '../api/kitchen.types';
import type { OrderItemStatus } from '../../order/api/order.types';

/**
 * Determines the new order_status that should be set after item statuses change.
 * - All items ready            → 'ready'   (order closes automatically)
 * - Any item cooking           → 'cooking' (order moves to production)
 * - All items pending / empty  → null      (no change needed)
 */
export const calculateNewOrderStatus = (
  statuses: OrderItemStatus[],
): 'cooking' | 'ready' | null => {
  if (statuses.length === 0) return null;
  if (statuses.every((s) => s === 'ready')) return 'ready';
  if (statuses.some((s) => s === 'cooking')) return 'cooking';
  return null;
};

export interface FabData {
  targetStatus: OrderItemStatus | null;
  items: KitchenRawItem[];
}

/**
 * Derives FAB state from selected groups.
 * FAB is only enabled when ALL selected items share the same actionable status.
 * - All pending  → target = 'cooking'
 * - All cooking  → target = 'ready'
 * - Mixed / ready / empty → target = null (FAB disabled)
 */
export const computeFabData = (
  categories: KitchenCategory[],
  selectedGroupKeys: Set<string>,
): FabData => {
  const selectedItems = categories
    .flatMap((cat) => cat.groups)
    .filter((g) => selectedGroupKeys.has(g.key))
    .flatMap((g) => g.items);

  if (selectedItems.length === 0) return { targetStatus: null, items: [] };

  const allStatuses = new Set(selectedItems.map((i) => i.status));
  if (allStatuses.size !== 1) return { targetStatus: null, items: [] };

  const sharedStatus = [...allStatuses][0] as OrderItemStatus;
  const targetStatus: OrderItemStatus | null =
    sharedStatus === 'pending' ? 'cooking' :
    sharedStatus === 'cooking' ? 'ready' : null;

  return { targetStatus, items: selectedItems };
};
