import type { Cart } from './cart.js';

export interface CartRepository {
  findById(id: string): Promise<Cart | null>;
  /** Creates the cart if new, and replaces its items with the cart's current items. */
  save(cart: Cart): Promise<void>;
}

export const CART_REPOSITORY = Symbol('CartRepository');
