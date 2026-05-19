import type { CustomerCategory, TaxStatus } from '../api/customer.types';

export const CATEGORY_LABELS: Record<CustomerCategory, string> = {
  individual: 'Minorista',
  wholesale: 'Mayorista',
};

export const TAX_STATUS_LABELS: Record<TaxStatus, string> = {
  final_consumer: 'Consumidor Final',
  simplified_taxpayer: 'Monotributista',
  registered_responsible: 'Responsable Inscripto',
  exempt: 'Exento',
};

export const getDefaultTaxStatus = (category: CustomerCategory): TaxStatus =>
  category === 'wholesale' ? 'simplified_taxpayer' : 'final_consumer';
