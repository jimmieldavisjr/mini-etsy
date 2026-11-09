import type { Category, CategoryWithCount } from './category.js';
import type { Product } from './product.js';

export type ProductSort = 'new' | 'price_asc' | 'price_desc';

export interface ProductFilter {
  categoryId?: string;
  titleContains?: string;
  sort: ProductSort;
  limit: number;
}

export interface CategoryRepository {
  findAllWithCounts(): Promise<CategoryWithCount[]>;
  findBySlug(slug: string): Promise<Category | null>;
}

export interface ProductRepository {
  /** Active products only. */
  list(filter: ProductFilter): Promise<Product[]>;
  /** Active products only. */
  findBySlug(slug: string): Promise<Product | null>;
  /** Includes inactive products, so callers can tell "gone" from "unknown". */
  findByIds(ids: readonly string[]): Promise<Product[]>;
  /**
   * Lowers stock by `quantity` only if that much is left. Returns false when
   * it is not, so concurrent checkouts cannot oversell.
   */
  decrementStock(productId: string, quantity: number): Promise<boolean>;
}

export const CATEGORY_REPOSITORY = Symbol('CategoryRepository');
export const PRODUCT_REPOSITORY = Symbol('ProductRepository');
