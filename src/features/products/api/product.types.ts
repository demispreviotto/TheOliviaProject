// src/features/products/api/product.types.ts
export const PRODUCT_CATEGORIES = [
  { id: 'pepas', label: 'Pepas' },
  { id: 'budin_integral', label: 'Budín Integral' },
  { id: 'budin_avena', label: 'Budín de Avena' },
  { id: 'cookies', label: 'Cookies' },
  { id: 'cookies_xl', label: 'Cookies XL' },
  { id: 'alfajores', label: 'Alfajores' },
  { id: 'pan', label: 'Pan' },
  { id: 'talitas', label: 'Talitas' },
  { id: 'galleta_marinera', label: 'Galleta Marinera' },
  { id: 'torta', label: 'Torta' },
] as const;

export type ProductType = (typeof PRODUCT_CATEGORIES)[number]['id'];

export const CATEGORY_IDS = PRODUCT_CATEGORIES.map(cat => cat.id) as [ProductType, ...ProductType[]];
export interface Product {
  id: string;
  variety: string;
  product_category: ProductType;
  unit: number;
  grams?: number | null;
  wholesale_price: number;
  retail_price: number;
  is_active: boolean;
  created_at?: string;
}

export type CreateProductInput = Omit<Product, 'id' | 'created_at'>;
export type UpdateProductInput = Partial<CreateProductInput> & { id: string };
