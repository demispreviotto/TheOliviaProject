import type { Customer } from "../../customers/api/customer.types";
import type { Product } from "../../products/api/product.types";

export type OrderStatus = 'pending' | 'cooking' | 'ready' | 'delivered' | 'cancelled';
export type OrderDeliveryMode = 'pickup' | 'delivery';
export type OrderPaymentState = 'pending' | 'partially_paid' | 'paid';
export type OrderPaymentMethod = 'cash' | 'transfer' | 'mixed';

export interface OrderItem {
  id?: string;
  order_id?: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  notes?: string | null;
  products?: Product;
}

export interface Order {
  id: string;
  customer_id: string;
  order_status: OrderStatus;
  delivery_mode: OrderDeliveryMode;
  payment_state: OrderPaymentState;
  pay_method: OrderPaymentMethod | null;
  delivery_date: string;
  transfer_amount: number;
  cash_amount: number;
  total_price: number;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
  customer?: Customer;
}

export type CreateOrderInput = Omit<Order, 'id' | 'created_at' | 'updated_at' | 'order_items'> & {
  order_items: OrderItem[];
};

export type UpdateOrderInput = Partial<CreateOrderInput> & { id: string };
