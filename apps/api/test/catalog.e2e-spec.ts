import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type {
  CategoryDto,
  ProductDetailDto,
  ProductSummaryDto,
} from '@mini-etsy/shared';
import { createTestApp } from './create-test-app.js';

describe('Catalog (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /categories lists the five seeded categories with counts', async () => {
    const res = await request(app.getHttpServer()).get('/categories').expect(200);
    const categories = res.body as CategoryDto[];
    expect(categories.map((c) => c.slug).sort()).toEqual([
      'art-and-prints',
      'clothing',
      'home-and-living',
      'jewelry',
      'paper-goods',
    ]);
    expect(categories.every((c) => c.productCount >= 4)).toBe(true);
  });

  it('GET /products?category= lists only that category', async () => {
    const res = await request(app.getHttpServer())
      .get('/products?category=jewelry')
      .expect(200);
    const products = res.body as ProductSummaryDto[];
    expect(products.length).toBeGreaterThanOrEqual(4);
    expect(products.every((p) => p.categorySlug === 'jewelry')).toBe(true);
  });

  it('GET /products?category= with an unknown slug is a 404', async () => {
    await request(app.getHttpServer())
      .get('/products?category=not-a-category')
      .expect(404);
  });

  it('GET /products?q= searches titles, ignoring case', async () => {
    const res = await request(app.getHttpServer())
      .get('/products?q=MUG')
      .expect(200);
    const products = res.body as ProductSummaryDto[];
    expect(products.map((p) => p.title)).toEqual(['Speckled Stoneware Mug']);
  });

  it('GET /products?sort=price_asc sorts by price', async () => {
    const res = await request(app.getHttpServer())
      .get('/products?sort=price_asc&limit=5')
      .expect(200);
    const prices = (res.body as ProductSummaryDto[]).map((p) => p.priceCents);
    expect(prices).toHaveLength(5);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  it('GET /products rejects a bad sort', async () => {
    await request(app.getHttpServer()).get('/products?sort=random').expect(400);
  });

  it('GET /products/:slug returns the detail, or 404', async () => {
    const res = await request(app.getHttpServer())
      .get('/products/speckled-stoneware-mug')
      .expect(200);
    const product = res.body as ProductDetailDto;
    expect(product).toMatchObject({
      title: 'Speckled Stoneware Mug',
      categoryName: 'Home & Living',
      shopName: 'Kiln Street Pottery',
    });

    await request(app.getHttpServer()).get('/products/nope').expect(404);
  });
});
