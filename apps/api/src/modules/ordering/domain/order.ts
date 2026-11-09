import { ValidationError } from '../../../shared/domain/domain-error.js';
import { Entity } from '../../../shared/domain/entity.js';
import { Money } from '../../../shared/domain/money.js';
import { Quantity } from '../../../shared/domain/quantity.js';
import { canTransition, isOrderStatus, type OrderStatus } from './order-status.js';
import { EmptyOrderError, InvalidStatusTransitionError } from './ordering.errors.js';

/** A line on an order, with the title and price copied at checkout. */
export class OrderLine {
  constructor(
    readonly productId: string,
    readonly titleSnapshot: string,
    readonly unitPrice: Money,
    readonly quantity: Quantity,
  ) {}

  get lineTotal(): Money {
    return this.unitPrice.multiply(this.quantity.value);
  }
}

export interface ShippingDetails {
  email: string;
  shippingName: string;
  shippingAddress: string;
}

export interface OrderLineProps {
  productId: string;
  titleSnapshot: string;
  unitPriceCents: number;
  quantity: number;
}

/**
 * The Order aggregate. It owns its lines and total, and is the only place an
 * order's status can change, so the status rules cannot be bypassed.
 */
export class Order extends Entity {
  private constructor(
    id: string,
    private currentStatus: OrderStatus,
    readonly lines: readonly OrderLine[],
    readonly shipping: ShippingDetails,
    readonly createdAt: Date,
  ) {
    super(id);
  }

  /** Places a new order in Pending. */
  static place(
    shipping: ShippingDetails,
    lines: readonly OrderLineProps[],
    id: string = globalThis.crypto.randomUUID(),
  ): Order {
    if (lines.length === 0) throw new EmptyOrderError();
    const cleaned = Order.cleanShipping(shipping);
    return new Order(id, 'Pending', lines.map(toLine), cleaned, new Date());
  }

  static restore(props: {
    id: string;
    status: string;
    email: string;
    shippingName: string;
    shippingAddress: string;
    createdAt: Date;
    lines: OrderLineProps[];
  }): Order {
    if (!isOrderStatus(props.status)) {
      throw new ValidationError(`Unknown order status "${props.status}"`);
    }
    return new Order(
      props.id,
      props.status,
      props.lines.map(toLine),
      {
        email: props.email,
        shippingName: props.shippingName,
        shippingAddress: props.shippingAddress,
      },
      props.createdAt,
    );
  }

  get status(): OrderStatus {
    return this.currentStatus;
  }

  get total(): Money {
    return Money.sum(this.lines.map((l) => l.lineTotal));
  }

  changeStatus(next: OrderStatus): void {
    if (!canTransition(this.currentStatus, next)) {
      throw new InvalidStatusTransitionError(this.currentStatus, next);
    }
    this.currentStatus = next;
  }

  private static cleanShipping(shipping: ShippingDetails): ShippingDetails {
    const cleaned = {
      email: shipping.email.trim().toLowerCase(),
      shippingName: shipping.shippingName.trim(),
      shippingAddress: shipping.shippingAddress.trim(),
    };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned.email)) {
      throw new ValidationError('A valid email is required');
    }
    if (!cleaned.shippingName) {
      throw new ValidationError('A shipping name is required');
    }
    if (!cleaned.shippingAddress) {
      throw new ValidationError('A shipping address is required');
    }
    return cleaned;
  }
}

function toLine(props: OrderLineProps): OrderLine {
  return new OrderLine(
    props.productId,
    props.titleSnapshot,
    Money.fromCents(props.unitPriceCents),
    Quantity.of(props.quantity),
  );
}
