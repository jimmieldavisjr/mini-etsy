import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../../generated/prisma/client.js';
import { PrismaService } from '../../../shared/infrastructure/prisma.service.js';
import type {
  ProductFilter,
  ProductRepository,
  ProductSort,
} from '../domain/catalog.repositories.js';
import { Product } from '../domain/product.js';

const withCategory = {
  category: { select: { id: true, slug: true, name: true } },
} satisfies Prisma.ProductInclude;

type ProductRow = Prisma.ProductGetPayload<{ include: typeof withCategory }>;

const ORDER_BY: Record<ProductSort, Prisma.ProductOrderByWithRelationInput[]> =
  {
    new: [{ createdAt: 'desc' }, { title: 'asc' }],
    price_asc: [{ priceCents: 'asc' }, { title: 'asc' }],
    price_desc: [{ priceCents: 'desc' }, { title: 'asc' }],
  };

function toDomain(row: ProductRow): Product {
  return Product.restore(row);
}

@Injectable()
export class PrismaProductRepository implements ProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async list(filter: ProductFilter): Promise<Product[]> {
    const rows = await this.prisma.db.product.findMany({
      where: {
        active: true,
        categoryId: filter.categoryId,
        // SQLite's LIKE is case-insensitive for ASCII, which covers titles.
        title: filter.titleContains
          ? { contains: filter.titleContains }
          : undefined,
      },
      include: withCategory,
      orderBy: ORDER_BY[filter.sort],
      take: filter.limit,
    });
    return rows.map(toDomain);
  }

  async findBySlug(slug: string): Promise<Product | null> {
    const row = await this.prisma.db.product.findFirst({
      where: { slug, active: true },
      include: withCategory,
    });
    return row ? toDomain(row) : null;
  }

  async findByIds(ids: readonly string[]): Promise<Product[]> {
    const rows = await this.prisma.db.product.findMany({
      where: { id: { in: [...ids] } },
      include: withCategory,
    });
    return rows.map(toDomain);
  }

  async decrementStock(productId: string, quantity: number): Promise<boolean> {
    const { count } = await this.prisma.db.product.updateMany({
      where: { id: productId, active: true, stock: { gte: quantity } },
      data: { stock: { decrement: quantity } },
    });
    return count === 1;
  }
}
