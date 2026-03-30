import type { Product, ProductCategory } from '../types/product';

export const PRODUCT_CATEGORY_SORT_ORDER: ProductCategory[] = [
  'sticker',
  'keychain',
  'badge',
  'ribbon',
  'print',
  'textile',
  'set',
  'swap',
  'other',
];

const categoryRank = new Map<ProductCategory, number>(
  PRODUCT_CATEGORY_SORT_ORDER.map((category, index) => [category, index]),
);

function getCategoryRank(category: ProductCategory): number {
  return categoryRank.get(category) ?? PRODUCT_CATEGORY_SORT_ORDER.length;
}

export function compareProductsBySiteOrder(a: Product, b: Product): number {
  if (a.inStock !== b.inStock) {
    return a.inStock ? -1 : 1;
  }

  const categoryDiff = getCategoryRank(a.category) - getCategoryRank(b.category);
  if (categoryDiff !== 0) return categoryDiff;

  return a.id - b.id;
}

export function sortProductsBySiteOrder(products: Product[]): Product[] {
  return [...products].sort(compareProductsBySiteOrder);
}
