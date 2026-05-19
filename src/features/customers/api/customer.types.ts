export type CustomerCategory = 'individual' | 'wholesale';

export type TaxStatus =
  'final_consumer' |
  'simplified_taxpayer' |
  'registered_responsible' |
  'exempt';

export interface Customer {
  id: string;
  category: CustomerCategory;
  tax_status: TaxStatus;
  full_name: string;
  company_name?: string | null;
  tax_id?: string | null;
  phone?: string | null;
  email?: string | null;
  delivery_address?: string | null;
  billing_address?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export type CreateCustomerInput = Omit<Customer, 'id' | 'created_at' | 'updated_at'>;
export type UpdateCustomerInput = Partial<CreateCustomerInput> & { id: string };
