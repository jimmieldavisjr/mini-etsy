import { ValidationError } from '../../../shared/domain/domain-error.js';
import { Order } from './order.js';
import { ORDER_STATUSES, type OrderStatus } from './order-status.js';
import { EmptyOrderError, InvalidStatusTransitionError } from './ordering.errors.js';

const shipping = {
  email: ' Buyer@Example.com ',
  shippingName: 'Sam Buyer',
  shippingAddress: '1 Example Street\nSpringfield',
};

const lines = [
  { productId: 'p1', titleSnapshot: 'Mug', unitPriceCents: 1800, quantity: 2 },
  { productId: 'p2', titleSnapshot: 'Card', unitPriceCents: 450, quantity: 3 },
];

function orderIn(status: OrderStatus): Order {
  return Order.restore({
    id: 'o1',
    status,
    createdAt: new Date(),
    lines,
    ...shipping,
  });
}

const ALLOWED: ReadonlyArray<[OrderStatus, OrderStatus]> = [
  ['Pending', 'Paid'],
  ['Pending', 'Cancelled'],
  ['Paid', 'Shipped'],
  ['Paid', 'Cancelled'],
  ['Shipped', 'Delivered'],
];

const isAllowed = (from: OrderStatus, to: OrderStatus) =>
  ALLOWED.some(([f, t]) => f === from && t === to);

const ALL_PAIRS = ORDER_STATUSES.flatMap((from) =>
  ORDER_STATUSES.map((to) => [from, to] as [OrderStatus, OrderStatus]),
);
const REJECTED = ALL_PAIRS.filter(([from, to]) => !isAllowed(from, to));

describe('Order', () => {
  it('is placed as Pending with a total from its lines', () => {
    const order = Order.place(shipping, lines);
    expect(order.status).toBe('Pending');
    expect(order.total.cents).toBe(2 * 1800 + 3 * 450);
    expect(order.shipping.email).toBe('buyer@example.com');
  });

  it('needs at least one line', () => {
    expect(() => Order.place(shipping, [])).toThrow(EmptyOrderError);
  });

  it('needs a valid email, name and address', () => {
    expect(() => Order.place({ ...shipping, email: 'nope' }, lines)).toThrow(
      ValidationError,
    );
    expect(() =>
      Order.place({ ...shipping, shippingName: '  ' }, lines),
    ).toThrow(ValidationError);
    expect(() =>
      Order.place({ ...shipping, shippingAddress: '' }, lines),
    ).toThrow(ValidationError);
  });

  it.each(ALLOWED)('allows %s -> %s', (from, to) => {
    const order = orderIn(from);
    order.changeStatus(to);
    expect(order.status).toBe(to);
  });

  it.each(REJECTED)('rejects %s -> %s', (from, to) => {
    const order = orderIn(from);
    expect(() => order.changeStatus(to)).toThrow(InvalidStatusTransitionError);
    expect(order.status).toBe(from);
  });

  it('covers all 25 status pairs between the two lists', () => {
    expect(ALLOWED.length + REJECTED.length).toBe(25);
  });
});
