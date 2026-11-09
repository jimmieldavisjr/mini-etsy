import { Inject, Injectable } from '@nestjs/common';
import { CART_REPOSITORY, type CartRepository } from '../domain/cart.repository.js';

/** A cart line as other modules see it. */
export interface CartLineSnapshot {
  productId: string;
  quantity: number;
}

/**
 * Cart's public service, exported through the module's index.ts. Ordering
 * binds its CartSource port to this class.
 */
@Injectable()
export class CartQueryService {
  constructor(
    @Inject(CART_REPOSITORY) private readonly carts: CartRepository,
  ) {}

  async getItems(cartId: string): Promise<CartLineSnapshot[]> {
    const cart = await this.carts.findById(cartId);
    if (!cart) return [];
    return cart.items.map((i) => ({
      productId: i.productId,
      quantity: i.quantity.value,
    }));
  }

  async clear(cartId: string): Promise<void> {
    const cart = await this.carts.findById(cartId);
    if (!cart) return;
    cart.clear();
    await this.carts.save(cart);
  }
}
