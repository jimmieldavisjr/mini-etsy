import { Inject, Injectable } from '@nestjs/common';
import type { CartDto } from '@mini-etsy/shared';
import { Quantity } from '../../../shared/domain/quantity.js';
import { Cart } from '../domain/cart.js';
import { CartItemNotFoundError, ProductUnavailableError } from '../domain/cart.errors.js';
import { CART_REPOSITORY, type CartRepository } from '../domain/cart.repository.js';
import { buildCartDto, emptyCartDto } from './cart-view.js';
import {
  PRODUCT_LOOKUP,
  type CartProductInfo,
  type ProductLookup,
} from './product-lookup.port.js';

/** Shared plumbing for the cart use cases. */
abstract class CartUseCase {
  constructor(
    protected readonly carts: CartRepository,
    protected readonly products: ProductLookup,
  ) {}

  protected async loadProduct(productId: string): Promise<CartProductInfo> {
    const [product] = await this.products.findProducts([productId]);
    if (!product || !product.active) {
      throw new ProductUnavailableError(productId);
    }
    return product;
  }

  protected async loadExistingCart(cartId: string | undefined): Promise<Cart> {
    const cart = cartId ? await this.carts.findById(cartId) : null;
    // No cart means nothing is in it, so any item the caller names is missing.
    if (!cart) throw new CartItemNotFoundError('requested');
    return cart;
  }
}

@Injectable()
export class GetCart extends CartUseCase {
  constructor(
    @Inject(CART_REPOSITORY) carts: CartRepository,
    @Inject(PRODUCT_LOOKUP) products: ProductLookup,
  ) {
    super(carts, products);
  }

  async execute(cartId: string | undefined): Promise<CartDto> {
    const cart = cartId ? await this.carts.findById(cartId) : null;
    return cart ? buildCartDto(cart, this.products) : emptyCartDto();
  }
}

@Injectable()
export class AddItem extends CartUseCase {
  constructor(
    @Inject(CART_REPOSITORY) carts: CartRepository,
    @Inject(PRODUCT_LOOKUP) products: ProductLookup,
  ) {
    super(carts, products);
  }

  /** Creates a cart when there is none yet; the caller stores the returned id. */
  async execute(
    cartId: string | undefined,
    productId: string,
    quantity: number,
  ): Promise<CartDto> {
    const product = await this.loadProduct(productId);
    const cart =
      (cartId ? await this.carts.findById(cartId) : null) ?? Cart.create();
    cart.addItem(productId, Quantity.of(quantity), product.stock);
    await this.carts.save(cart);
    return buildCartDto(cart, this.products);
  }
}

@Injectable()
export class UpdateQuantity extends CartUseCase {
  constructor(
    @Inject(CART_REPOSITORY) carts: CartRepository,
    @Inject(PRODUCT_LOOKUP) products: ProductLookup,
  ) {
    super(carts, products);
  }

  async execute(
    cartId: string | undefined,
    productId: string,
    quantity: number,
  ): Promise<CartDto> {
    const cart = await this.loadExistingCart(cartId);
    const product = await this.loadProduct(productId);
    cart.setQuantity(productId, Quantity.of(quantity), product.stock);
    await this.carts.save(cart);
    return buildCartDto(cart, this.products);
  }
}

@Injectable()
export class RemoveItem extends CartUseCase {
  constructor(
    @Inject(CART_REPOSITORY) carts: CartRepository,
    @Inject(PRODUCT_LOOKUP) products: ProductLookup,
  ) {
    super(carts, products);
  }

  async execute(cartId: string | undefined, productId: string): Promise<CartDto> {
    const cart = await this.loadExistingCart(cartId);
    cart.removeItem(productId);
    await this.carts.save(cart);
    return buildCartDto(cart, this.products);
  }
}
