import { Inject, Injectable } from '@nestjs/common';
import type { OrderDto } from '@mini-etsy/shared';
import {
  TRANSACTION_RUNNER,
  type TransactionRunner,
} from '../../../shared/application/transaction-runner.js';
import { Order, type OrderLineProps, type ShippingDetails } from '../domain/order.js';
import { ORDER_REPOSITORY, type OrderRepository } from '../domain/order.repository.js';
import { EmptyCartError, InsufficientStockError } from '../domain/ordering.errors.js';
import { toOrderDto } from './order.mapper.js';
import {
  CART_SOURCE,
  PRODUCT_PRICING,
  type CartSource,
  type ProductPricing,
} from './ports.js';

/**
 * Turns the cart into an order. In one transaction it reads current prices
 * and stock, rejects the whole order if any line is short, saves the order
 * with price snapshots, lowers stock and empties the cart.
 */
@Injectable()
export class Checkout {
  constructor(
    @Inject(TRANSACTION_RUNNER) private readonly tx: TransactionRunner,
    @Inject(CART_SOURCE) private readonly cart: CartSource,
    @Inject(PRODUCT_PRICING) private readonly pricing: ProductPricing,
    @Inject(ORDER_REPOSITORY) private readonly orders: OrderRepository,
  ) {}

  execute(cartId: string | undefined, shipping: ShippingDetails): Promise<OrderDto> {
    return this.tx.run(async () => {
      if (!cartId) throw new EmptyCartError();
      const items = await this.cart.getItems(cartId);
      if (items.length === 0) throw new EmptyCartError();

      const products = await this.pricing.findProducts(items.map((i) => i.productId));
      const byId = new Map(products.map((p) => [p.id, p]));

      const problems: string[] = [];
      const lines: OrderLineProps[] = [];
      for (const item of items) {
        const product = byId.get(item.productId);
        if (!product || !product.active) {
          problems.push(`${product?.title ?? 'An item'} is no longer available`);
        } else if (product.stock < item.quantity) {
          problems.push(
            product.stock === 0
              ? `${product.title} is sold out`
              : `only ${product.stock} of ${product.title} left`,
          );
        } else {
          lines.push({
            productId: product.id,
            titleSnapshot: product.title,
            unitPriceCents: product.priceCents,
            quantity: item.quantity,
          });
        }
      }
      if (problems.length > 0) throw new InsufficientStockError(problems);

      const order = Order.place(shipping, lines);

      for (const line of lines) {
        // Guards against another checkout taking the stock since we read it.
        const reserved = await this.pricing.reserveStock(line.productId, line.quantity);
        if (!reserved) {
          throw new InsufficientStockError([`${line.titleSnapshot} just sold out`]);
        }
      }
      await this.orders.create(order);
      await this.cart.clear(cartId);

      return toOrderDto(order);
    });
  }
}
