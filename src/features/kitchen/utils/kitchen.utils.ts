import type { KitchenCategory, KitchenProductGroup } from '../api/kitchen.types';
import type { OrderItemStatus } from '../../order/api/order.types';
import type { ProductType } from '../../products/api/product.types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const aggregateKitchenData = (orders: any[]): KitchenCategory[] => {
  const categoryMap = new Map<ProductType, Map<string, KitchenProductGroup>>();

  for (const order of orders) {
    for (const item of order.order_items ?? []) {
      const product = item.products;
      if (!product) continue;

      const category = product.product_category as ProductType;
      const groupKey = `${product.product_name}__${product.presentation ?? ''}`;

      if (!categoryMap.has(category)) {
        categoryMap.set(category, new Map());
      }
      const groupMap = categoryMap.get(category)!;

      if (!groupMap.has(groupKey)) {
        groupMap.set(groupKey, {
          key: groupKey,
          productName: product.product_name,
          presentation: product.presentation ?? '',
          totalQuantity: 0,
          items: [],
        });
      }

      const group = groupMap.get(groupKey)!;
      group.totalQuantity += item.quantity;
      group.items.push({
        id: item.id,
        orderId: order.id,
        quantity: item.quantity,
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

export const CATEGORY_LABELS: Record<ProductType, string> = {
  pepas: 'Pepas',
  budin: 'Budín',
  cookies: 'Cookies',
  alfajores: 'Alfajores',
  pan: 'Pan',
  talitas: 'Talitas',
  torta: 'Torta',
};

export const STATUS_LABELS: Record<OrderItemStatus, string> = {
  pending: 'Pendiente',
  cooking: 'En Cocina',
  ready: 'Listo',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};
