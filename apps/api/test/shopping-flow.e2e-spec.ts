import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { CartDto, OrderDto, ProductDetailDto } from '@mini-etsy/shared';
import { createTestApp } from './create-test-app.js';

const shipping = {
  email: 'buyer@example.com',
  shippingName: 'Sam Buyer',
  shippingAddress: '1 Example Street, Springfield',
};

describe('Cart and Ordering (e2e)', () => {
  let app: INestApplication;
  let agent: ReturnType<typeof request.agent>;

  async function product(slug: string): Promise<ProductDetailDto> {
    const res = await request(app.getHttpServer())
      .get(`/products/${slug}`)
      .expect(200);
    return res.body as ProductDetailDto;
  }

  beforeAll(async () => {
    app = await createTestApp();
  });

  beforeEach(() => {
    // A fresh agent is a fresh guest: it keeps its own cart cookie.
    agent = request.agent(app.getHttpServer());
  });

  afterAll(async () => {
    await app.close();
  });

  it('starts with an empty cart and no cookie', async () => {
    const res = await agent.get('/cart').expect(200);
    expect(res.body).toEqual({ id: null, lines: [], itemCount: 0, subtotalCents: 0 });
    expect(res.headers['set-cookie']).toBeUndefined();
  });

  it('adds to the cart, sets the cookie and merges a re-add', async () => {
    const mug = await product('speckled-stoneware-mug');

    const first = await agent
      .post('/cart/items')
      .send({ productId: mug.id, quantity: 1 })
      .expect(201);
    expect(String(first.headers['set-cookie'])).toMatch(/cart_id=.+HttpOnly/);

    await agent.post('/cart/items').send({ productId: mug.id, quantity: 2 }).expect(201);

    const cart = (await agent.get('/cart').expect(200)).body as CartDto;
    expect(cart.lines).toHaveLength(1);
    expect(cart.lines[0]).toMatchObject({ productId: mug.id, quantity: 3 });
    expect(cart.subtotalCents).toBe(3 * mug.priceCents);
  });

  it('updates and removes cart lines', async () => {
    const card = await product('letterpress-thank-you-cards-set-of-6');
    await agent.post('/cart/items').send({ productId: card.id, quantity: 1 }).expect(201);

    const updated = await agent
      .patch(`/cart/items/${card.id}`)
      .send({ quantity: 4 })
      .expect(200);
    expect((updated.body as CartDto).lines[0].quantity).toBe(4);

    const removed = await agent.delete(`/cart/items/${card.id}`).expect(200);
    expect((removed.body as CartDto).lines).toEqual([]);
  });

  it('rejects quantities over stock, and invalid input', async () => {
    const painting = await product('original-abstract-acrylic-on-canvas'); // stock 1
    await agent
      .post('/cart/items')
      .send({ productId: painting.id, quantity: 2 })
      .expect(409);
    await agent
      .post('/cart/items')
      .send({ productId: painting.id, quantity: 0 })
      .expect(400);
    await agent
      .post('/cart/items')
      .send({ productId: 'does-not-exist', quantity: 1 })
      .expect(404);
  });

  it('checks out the cart into an order, then fetches it', async () => {
    const mug = await product('speckled-stoneware-mug');
    const candle = await product('hand-poured-soy-candle-cedar-and-fig');
    await agent.post('/cart/items').send({ productId: mug.id, quantity: 2 }).expect(201);
    await agent.post('/cart/items').send({ productId: candle.id, quantity: 1 }).expect(201);

    const created = await agent.post('/orders').send(shipping).expect(201);
    const order = created.body as OrderDto;
    expect(order.status).toBe('Pending');
    expect(order.totalCents).toBe(2 * mug.priceCents + candle.priceCents);
    expect(order.lines.map((l) => l.title).sort()).toEqual(
      [candle.title, mug.title].sort(),
    );
    // Lines keep a snapshot of the photo, like the title and price.
    expect(order.lines.find((l) => l.productId === mug.id)?.imageUrl).toBe(mug.imageUrl);

    // Stock went down, and the cart is empty.
    expect((await product('speckled-stoneware-mug')).stock).toBe(mug.stock - 2);
    expect(((await agent.get('/cart').expect(200)).body as CartDto).lines).toEqual([]);

    const fetched = await request(app.getHttpServer())
      .get(`/orders/${order.id}`)
      .expect(200);
    expect(fetched.body).toEqual(order);
  });

  it('rejects checkout with an empty cart or bad details', async () => {
    await agent.post('/orders').send(shipping).expect(400);

    const mug = await product('speckled-stoneware-mug');
    await agent.post('/cart/items').send({ productId: mug.id, quantity: 1 }).expect(201);
    await agent
      .post('/orders')
      .send({ ...shipping, email: 'not-an-email' })
      .expect(400);
  });

  it('moves an order through its status flow and rejects bad moves', async () => {
    const mug = await product('speckled-stoneware-mug');
    await agent.post('/cart/items').send({ productId: mug.id, quantity: 1 }).expect(201);
    const order = (await agent.post('/orders').send(shipping).expect(201)).body as OrderDto;

    await request(app.getHttpServer())
      .patch(`/orders/${order.id}/status`)
      .send({ status: 'Delivered' })
      .expect(409);

    for (const status of ['Paid', 'Shipped', 'Delivered']) {
      const res = await request(app.getHttpServer())
        .patch(`/orders/${order.id}/status`)
        .send({ status })
        .expect(200);
      expect((res.body as OrderDto).status).toBe(status);
    }

    await request(app.getHttpServer())
      .patch(`/orders/${order.id}/status`)
      .send({ status: 'Cancelled' })
      .expect(409);
  });

  it('returns 404 for an unknown order', async () => {
    await request(app.getHttpServer())
      .get('/orders/00000000-0000-4000-8000-000000000000')
      .expect(404);
  });
});
