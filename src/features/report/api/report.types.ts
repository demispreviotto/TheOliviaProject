export interface ProductReportRow {
  product_id: string;
  variety: string;
  product_category: string;
  total_units: number;
  total_revenue: number;
  total_discount: number;
}

export interface ClientReportRow {
  customer_id: string;
  full_name: string;
  company_name: string | null;
  category: 'individual' | 'wholesale';
  order_count: number;
  total_amount: number;
  prev_total_amount: number;
  delta: number; // current - prev
}

export interface MonthlyKpis {
  total_orders: number;
  total_income: number;
  collected_income: number;
  pending_income: number;
  total_units: number;
  cancelled_orders: number;
  cancelled_value: number;
  cash_amount: number;
  transfer_amount: number;
}

export interface MonthlyReportData {
  kpis: MonthlyKpis;
  products: ProductReportRow[];
  clients: ClientReportRow[];
}
