import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { supabase } from '../../../api/supabase';
import type { Order } from '../../order/api/order.types';
import type {
  ClientReportRow,
  MonthlyKpis,
  MonthlyReportData,
  ProductReportRow,
} from './report.types';

async function fetchOrdersForMonth(from: string, to: string): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      id, customer_id, order_status, payment_state, pay_method,
      total_price, transfer_amount, cash_amount, delivery_date, created_at,
      order_items (
        product_id, quantity, unit_price, discount_amount,
        products ( id, variety, product_category )
      ),
      customer:customers ( id, full_name, company_name, category )
    `)
    .gte('delivery_date', from)
    .lte('delivery_date', to);

  if (error) throw error;
  return (data ?? []) as unknown as Order[];
}

function monthRange(year: number, month: number): { from: string; to: string } {
  const from = new Date(year, month, 1).toISOString().slice(0, 10);
  const to = new Date(year, month + 1, 0).toISOString().slice(0, 10);
  return { from, to };
}

function buildKpis(orders: Order[]): MonthlyKpis {
  const active = orders.filter((o) => o.order_status !== 'cancelled');
  const cancelled = orders.filter((o) => o.order_status === 'cancelled');

  let total_income = 0;
  let collected_income = 0;
  let pending_income = 0;
  let total_units = 0;
  let cash_amount = 0;
  let transfer_amount = 0;

  for (const o of active) {
    total_income += o.total_price;
    if (o.payment_state === 'paid') collected_income += o.total_price;
    else pending_income += o.total_price - (o.transfer_amount + o.cash_amount);
    cash_amount += o.cash_amount ?? 0;
    transfer_amount += o.transfer_amount ?? 0;
    for (const item of o.order_items ?? []) {
      total_units += item.quantity;
    }
  }

  return {
    total_orders: active.length,
    total_income,
    collected_income,
    pending_income,
    total_units,
    cancelled_orders: cancelled.length,
    cancelled_value: cancelled.reduce((sum, o) => sum + o.total_price, 0),
    cash_amount,
    transfer_amount,
  };
}

function buildProducts(orders: Order[]): ProductReportRow[] {
  const active = orders.filter((o) => o.order_status !== 'cancelled');
  const map = new Map<string, ProductReportRow>();

  for (const o of active) {
    for (const item of o.order_items ?? []) {
      const product = item.products;
      if (!product) continue;
      const existing = map.get(item.product_id);
      if (existing) {
        existing.total_units += item.quantity;
        existing.total_revenue += item.unit_price * item.quantity;
        existing.total_discount += item.discount_amount;
      } else {
        map.set(item.product_id, {
          product_id: item.product_id,
          variety: product.variety,
          product_category: product.product_category,
          total_units: item.quantity,
          total_revenue: item.unit_price * item.quantity,
          total_discount: item.discount_amount,
        });
      }
    }
  }

  return Array.from(map.values()).sort((a, b) => b.total_units - a.total_units);
}

function buildClients(
  currentOrders: Order[],
  prevOrders: Order[]
): ClientReportRow[] {
  const active = (orders: Order[]) =>
    orders.filter((o) => o.order_status !== 'cancelled');

  const aggregate = (orders: Order[]) => {
    const map = new Map<string, { amount: number; count: number }>();
    for (const o of active(orders)) {
      const existing = map.get(o.customer_id);
      if (existing) {
        existing.amount += o.total_price;
        existing.count += 1;
      } else {
        map.set(o.customer_id, { amount: o.total_price, count: 1 });
      }
    }
    return map;
  };

  const currMap = aggregate(currentOrders);
  const prevMap = aggregate(prevOrders);

  const customerMeta = new Map<string, Order['customer']>();
  for (const o of currentOrders) {
    if (o.customer && !customerMeta.has(o.customer_id)) {
      customerMeta.set(o.customer_id, o.customer);
    }
  }

  const rows: ClientReportRow[] = [];
  for (const [customer_id, curr] of currMap.entries()) {
    const meta = customerMeta.get(customer_id);
    const prev = prevMap.get(customer_id);
    rows.push({
      customer_id,
      full_name: meta ? (meta.full_name ?? '') : 'Cliente eliminado',
      company_name: meta?.company_name ?? null,
      category: (meta as { category?: 'individual' | 'wholesale' })?.category ?? 'individual',
      order_count: curr.count,
      total_amount: curr.amount,
      prev_total_amount: prev?.amount ?? 0,
      delta: curr.amount - (prev?.amount ?? 0),
    });
  }

  return rows.sort((a, b) => b.total_amount - a.total_amount);
}

export function useMonthlyReport(year: number, month: number) {
  const curr = monthRange(year, month);
  const prevDate = new Date(year, month - 1, 1);
  const prev = monthRange(prevDate.getFullYear(), prevDate.getMonth());

  const currentQuery = useQuery({
    queryKey: ['monthly-report', 'current', year, month],
    queryFn: () => fetchOrdersForMonth(curr.from, curr.to),
  });

  const prevQuery = useQuery({
    queryKey: ['monthly-report', 'prev', year, month],
    queryFn: () => fetchOrdersForMonth(prev.from, prev.to),
  });

  const data = useMemo<MonthlyReportData | null>(() => {
    if (!currentQuery.data) return null;
    const currentOrders = currentQuery.data;
    const prevOrders = prevQuery.data ?? [];
    return {
      kpis: buildKpis(currentOrders),
      products: buildProducts(currentOrders),
      clients: buildClients(currentOrders, prevOrders),
    };
  }, [currentQuery.data, prevQuery.data]);

  return {
    data,
    isLoading: currentQuery.isLoading || prevQuery.isLoading,
    isError: currentQuery.isError || prevQuery.isError,
  };
}
