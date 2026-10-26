// src/features/products/api/product.types.ts
// Etiquetas "lindas" para las categorías originales (pre-tabla `categories`).
// `product_category` ahora es un id libre (FK a `categories.id`, ver useCategories);
// una categoría nueva creada desde la UI no tiene entrada acá y se muestra tal cual
// (ver categoryLabelMap en products.utils.ts, que cae a `id` si no hay label).
export const PRODUCT_CATEGORIES = [
  { id: 'pepas', label: 'Pepas' },
  { id: 'budin_integral', label: 'Budín Integral' },
  { id: 'budin_avena', label: 'Budín de Avena' },
  { id: 'cookies', label: 'Cookies' },
  { id: 'cookies_xl', label: 'Cookies XL' },
  { id: 'alfajores', label: 'Alfajores' },
  { id: 'pan', label: 'Pan' },
  { id: 'talitas', label: 'Talitas' },
  { id: 'galleta_marinera', label: 'Galletas Marineras' },
  { id: 'galletitas', label: 'Galletitas' },
  { id: 'torta', label: 'Torta' },
] as const;

export type ProductType = string;

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
