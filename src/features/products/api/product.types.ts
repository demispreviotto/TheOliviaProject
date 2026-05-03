// src/features/products/api/product.types.ts
export type ProductType =
  | 'budin_integral'
  | 'budin_avena'
  | 'pepas'
  | 'cookies'
  | 'cookies_xl'
  | 'galletitas'
  | 'alfajores'
  | 'pan'
  | 'talitas'
  | 'galleta_marinera'
  | 'torta';

export interface Product {
  id: string;
  variety: string;
  product_category: ProductType;
  presentation?: string | null;
  unit: number;
  grams?: number | null;
  wholesale_price: number;
  retail_price: number;
  is_active: boolean;
  created_at?: string;
}

export type CreateProductInput = Omit<Product, 'id' | 'created_at'>;
export type UpdateProductInput = Partial<CreateProductInput> & { id: string };
