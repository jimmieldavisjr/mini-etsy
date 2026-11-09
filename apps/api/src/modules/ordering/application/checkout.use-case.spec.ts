import type { TransactionRunner } from '../../../shared/application/transaction-runner.js';
import type { Order } from '../domain/order.js';
import type { OrderRepository } from '../domain/order.repository.js';
import { EmptyCartError, InsufficientStockError } from '../domain/ordering.errors.js';
import { Checkout } from './checkout.use-case.js';
import type { CartSource, PricedProduct, ProductPricing } from './ports.js';

// ---------- In-memory fakes ----------

class FakeCart implements CartSource {
  constructor(public items: { productId: string; quantity: number }[]) {}
  async getItems() {
    return [...this.items];
  }
  async clear() {
    this.items = [];
  }
}

class FakeCatalog implements ProductPricing {
  constructor(public products: PricedProduct[]) {}
  async findProducts(ids: readonly string[]) {
    return this.products.filter((p) => ids.includes(p.id)).map((p) => ({ ...p }));
  }
  async reserveStock(productId: string, quantity: number) {
    const product = this.products.find((p) => p.id === productId);
    if (!product || product.stock < quantity) return false;
    product.stock -= quantity;
    return true;
  }
}

class InMemoryOrders implements OrderRepository {
  readonly saved = new Map<string, Order>();
  async findById(id: string) {
    return this.saved.get(id) ?? null;
  }
  async create(order: Order) {
    this.saved.set(order.id, order);
  }
  async updateStatus(order: Order) {
    this.saved.set(order.id, order);
  }
}

const runInline: TransactionRunner = { run: (work) => work() };

const shipping = {
  email: 'buyer@example.com',
  shippingName: 'Sam Buyer',
  shippingAddress: '1 Example Street',
};

function setup(
  items: { productId: string; quantity: number }[],
  products: PricedProduct[],
) {
  const cart = new FakeCart(items);
  const catalog = new FakeCatalog(products);
  const orders = new InMemoryOrders();
  const checkout = new Checkout(runInline, cart, catalog, orders);
  return { cart, catalog, orders, checkout };
}

const mug: PricedProduct = { id: 'mug', title: 'Speckled Mug', priceCents: 2800, stock: 5, active: true };
const card: PricedProduct = { id: 'card', title: 'Fox Card', priceCents: 450, stock: 1, active: true };

// ---------- Tests ----------

describe('Checkout', () => {
  it('creates a Pending order with price snapshots and lowers stock', async () => {
    const { checkout, catalog, orders } = setup(
      [
        { productId: 'mug', quantity: 2 },
        { productId: 'card', quantity: 1 },
      ],
      [{ ...mug }, { ...card }],
    );

    const order = await checkout.execute('cart-1', shipping);

    expect(order.status).toBe('Pending');
    expect(order.totalCents).toBe(2 * 2800 + 450);
    expect(order.lines).toEqual([
      { productId: 'mug', title: 'Speckled Mug', unitPriceCents: 2800, quantity: 2, lineTotalCents: 5600 },
      { productId: 'card', title: 'Fox Card', unitPriceCents: 450, quantity: 1, lineTotalCents: 450 },
    ]);
    expect(orders.saved.has(order.id)).toBe(true);
    expect(catalog.products.find((p) => p.id === 'mug')?.stock).toBe(3);
    expect(catalog.products.find((p) => p.id === 'card')?.stock).toBe(0);
  });

  it('keeps the snapshot price when the catalog price changes later', async () => {
    const { checkout, catalog, orders } = setup(
      [{ productId: 'mug', quantity: 1 }],
      [{ ...mug }],
    );
    const placed = await checkout.execute('cart-1', shipping);

    catalog.products[0].priceCents = 9900;
    catalog.products[0].title = 'Renamed Mug';

    const stored = orders.saved.get(placed.id)!;
    expect(stored.lines[0].unitPrice.cents).toBe(2800);
    expect(stored.lines[0].titleSnapshot).toBe('Speckled Mug');
  });

  it('clears the cart after a successful checkout', async () => {
    const { checkout, cart } = setup([{ productId: 'mug', quantity: 1 }], [{ ...mug }]);
    await checkout.execute('cart-1', shipping);
    expect(cart.items).toEqual([]);
  });

  it('rejects the whole order when any item is short, changing nothing', async () => {
    const { checkout, cart, catalog, orders } = setup(
      [
        { productId: 'mug', quantity: 1 },
        { productId: 'card', quantity: 2 },
      ],
      [{ ...mug }, { ...card }],
    );

    await expect(checkout.execute('cart-1', shipping)).rejects.toThrow(
      InsufficientStockError,
    );
    await expect(checkout.execute('cart-1', shipping)).rejects.toThrow(
      /only 1 of Fox Card left/,
    );
    expect(orders.saved.size).toBe(0);
    expect(cart.items).toHaveLength(2);
    expect(catalog.products.find((p) => p.id === 'mug')?.stock).toBe(5);
  });

  it('rejects items that left the catalog', async () => {
    const { checkout } = setup(
      [{ productId: 'mug', quantity: 1 }],
      [{ ...mug, active: false }],
    );
    await expect(checkout.execute('cart-1', shipping)).rejects.toThrow(
      /no longer available/,
    );
  });

  it('rejects an empty or missing cart', async () => {
    const { checkout } = setup([], [{ ...mug }]);
    await expect(checkout.execute('cart-1', shipping)).rejects.toThrow(EmptyCartError);
    await expect(checkout.execute(undefined, shipping)).rejects.toThrow(EmptyCartError);
  });
});
