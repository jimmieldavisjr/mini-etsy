/** What the cart needs to know about a product. */
export interface CartProductInfo {
  id: string;
  slug: string;
  title: string;
  shopName: string;
  priceCents: number;
  stock: number;
  active: boolean;
}

/**
 * Port to the catalog, defined by Cart in its own terms. Bound to Catalog's
 * public service in cart.module.ts.
 */
export interface ProductLookup {
  findProducts(ids: readonly string[]): Promise<CartProductInfo[]>;
}

export const PRODUCT_LOOKUP = Symbol('ProductLookup');
