// src/features/products/api/product.types.ts
export type ProductType = 'pepas' | 'budin' | 'cookies' | 'alfajores' | 'pan' | 'talitas' | 'torta';

export interface Product {
  id: string;
  product_name: string;
  product_category: ProductType;
  presentation?: string | null;
  wholesale_price: number;
  retail_price: number;
  is_active: boolean;
  created_at?: string;
}

export type CreateProductInput = Omit<Product, 'id' | 'created_at'>;
export type UpdateProductInput = Partial<CreateProductInput> & { id: string };
