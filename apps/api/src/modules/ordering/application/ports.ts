/** What Ordering needs to know about a product to price and fill a line. */
export interface PricedProduct {
  id: string;
  title: string;
  imageUrl: string | null;
  priceCents: number;
  stock: number;
  active: boolean;
}

/**
 * Port to the catalog, defined by Ordering in its own terms. Bound to
 * Catalog's public service in ordering.module.ts.
 */
export interface ProductPricing {
  findProducts(ids: readonly string[]): Promise<PricedProduct[]>;
  /** Lowers stock if enough is left. Returns false, changing nothing, if not. */
  reserveStock(productId: string, quantity: number): Promise<boolean>;
}

export const PRODUCT_PRICING = Symbol('ProductPricing');

/** Port to the cart. Bound to Cart's public service in ordering.module.ts. */
export interface CartSource {
  getItems(cartId: string): Promise<{ productId: string; quantity: number }[]>;
  clear(cartId: string): Promise<void>;
}

export const CART_SOURCE = Symbol('CartSource');
