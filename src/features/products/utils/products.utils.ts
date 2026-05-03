
import { PRODUCT_CATEGORIES, type Product } from "../api/product.types";

export const formatPresentation = (product: Partial<Product>): string => {
  if (product?.grams) {
    return `${product.grams}g`;
  }
  // Fallback to units if grams is null/undefined
  return `${product?.unit ?? 0}u`;
};

export const categoryLabelMap = PRODUCT_CATEGORIES.reduce((acc, cat) => {
  acc[cat.id] = cat.label;
  return acc;
}, {} as Record<string, string>);

/**
 * A standard way to display a product name across the app
 * Example: "Pepas de Membrillo - 500g"
 */
export const getFullProductName = (product: Partial<Product>): string => {
  if (!product?.product_category || !product?.variety) return 'Producto no disponible';
  
  const categoryLabel = categoryLabelMap[product.product_category] || product.product_category;
  return `${categoryLabel} ${product.variety} - ${formatPresentation(product)}`;
};