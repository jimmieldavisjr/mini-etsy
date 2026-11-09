import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/infrastructure/prisma.service.js';
import type { CategoryRepository } from '../domain/catalog.repositories.js';
import { Category, type CategoryWithCount } from '../domain/category.js';

@Injectable()
export class PrismaCategoryRepository implements CategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAllWithCounts(): Promise<CategoryWithCount[]> {
    const rows = await this.prisma.db.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { products: { where: { active: true } } } },
      },
    });
    return rows.map((row) => ({
      category: Category.restore(row),
      productCount: row._count.products,
    }));
  }

  async findBySlug(slug: string): Promise<Category | null> {
    const row = await this.prisma.db.category.findUnique({ where: { slug } });
    return row ? Category.restore(row) : null;
  }
}
