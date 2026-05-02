import type { OrderItemStatus } from '../../order/api/order.types';
import type { ProductType } from '../../products/api/product.types';

export interface KitchenRawItem {
  id: string;
  orderId: string;
  quantity: number;
  status: OrderItemStatus;
  notes?: string | null;
}

export interface KitchenProductGroup {
  key: string;
  productName: string;
  presentation: string;
  totalQuantity: number;
  items: KitchenRawItem[];
}

export interface KitchenCategory {
  category: ProductType;
  totalQuantity: number;
  groups: KitchenProductGroup[];
}
