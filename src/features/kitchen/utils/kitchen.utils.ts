import type { KitchenCategory, KitchenProductGroup, KitchenRawItem } from '../api/kitchen.types';
import type { OrderItemStatus } from '../../order/api/order.types';
import { PRODUCT_CATEGORIES, type ProductType } from '../../products/api/product.types';

const getPresentationLabel = (product: any) => {
  if (product.grams) return `${product.grams}g`;
  return `${product.unit}u`;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const aggregateKitchenData = (orders: any[]): KitchenCategory[] => {
  const categoryMap = new Map<ProductType, Map<string, KitchenProductGroup>>();

  for (const order of orders) {
    for (const item of order.order_items ?? []) {
      const product = item.products;
      if (!product) continue;

      const category = product.product_category as ProductType;
      const presentationLabel = getPresentationLabel(product);
      const groupKey = `${product.variety}__${presentationLabel}`;

      if (!categoryMap.has(category)) {
        categoryMap.set(category, new Map());
      }
      const groupMap = categoryMap.get(category)!;

      if (!groupMap.has(groupKey)) {
        groupMap.set(groupKey, {
          key: groupKey,
          productName: product.variety,
          presentation: presentationLabel,
          totalQuantity: 0,
          items: [],
        });
      }

      const group = groupMap.get(groupKey)!;
      const effectiveQty = item.quantity * (product.unit ?? 1);
      group.totalQuantity += effectiveQty;
      group.items.push({
        id: item.id,
        orderId: order.id,
        quantity: effectiveQty,
        status: (item.order_item_status ?? 'pending') as OrderItemStatus,
        notes: item.notes ?? null,
      });
    }
  }

  const result: KitchenCategory[] = [];
  for (const [category, groupMap] of categoryMap) {
    const groups = [...groupMap.values()];
    const totalQuantity = groups.reduce((acc, g) => acc + g.totalQuantity, 0);
    result.push({ category, totalQuantity, groups });
  }

  return result.sort((a, b) => a.category.localeCompare(b.category));
};

export const CATEGORY_LABELS = PRODUCT_CATEGORIES.reduce((acc, cat) => {
  acc[cat.id] = cat.label;
  return acc;
}, {} as Record<ProductType, string>);

export const STATUS_LABELS: Record<OrderItemStatus, string> = {
  pending: 'Pendiente',
  cooking: 'En Cocina',
  ready: 'Listo',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};

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
