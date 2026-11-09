import { Entity } from '../../../shared/domain/entity.js';
import { Quantity } from '../../../shared/domain/quantity.js';
import { CartItemNotFoundError, NotEnoughStockError } from './cart.errors.js';

/** One line in a cart: a product and how many of it. */
export interface CartItem {
  readonly productId: string;
  readonly quantity: Quantity;
}

/**
 * A guest's shopping cart. Holds one line per product: adding a product that
 * is already in the cart raises that line's quantity instead of adding a line.
 */
export class Cart extends Entity {
  private readonly lines: Map<string, Quantity>;

  private constructor(
    id: string,
    readonly createdAt: Date,
    items: readonly CartItem[],
  ) {
    super(id);
    this.lines = new Map(items.map((i) => [i.productId, i.quantity]));
  }

  static create(id: string = globalThis.crypto.randomUUID()): Cart {
    return new Cart(id, new Date(), []);
  }

  static restore(props: {
    id: string;
    createdAt: Date;
    items: { productId: string; quantity: number }[];
  }): Cart {
    return new Cart(
      props.id,
      props.createdAt,
      props.items.map((i) => ({
        productId: i.productId,
        quantity: Quantity.of(i.quantity),
      })),
    );
  }

  get items(): CartItem[] {
    return [...this.lines].map(([productId, quantity]) => ({
      productId,
      quantity,
    }));
  }

  get isEmpty(): boolean {
    return this.lines.size === 0;
  }

  quantityOf(productId: string): Quantity | undefined {
    return this.lines.get(productId);
  }

  /** Adds to the existing line for this product, or starts a new one. */
  addItem(productId: string, quantity: Quantity, inStock: number): void {
    const current = this.lines.get(productId);
    const next = current ? current.add(quantity) : quantity;
    this.ensureStock(next, inStock);
    this.lines.set(productId, next);
  }

  setQuantity(productId: string, quantity: Quantity, inStock: number): void {
    if (!this.lines.has(productId)) throw new CartItemNotFoundError(productId);
    this.ensureStock(quantity, inStock);
    this.lines.set(productId, quantity);
  }

  removeItem(productId: string): void {
    if (!this.lines.delete(productId)) {
      throw new CartItemNotFoundError(productId);
    }
  }

  clear(): void {
    this.lines.clear();
  }

  private ensureStock(quantity: Quantity, inStock: number): void {
    if (quantity.isMoreThan(inStock)) {
      throw new NotEnoughStockError(inStock);
    }
  }
}
