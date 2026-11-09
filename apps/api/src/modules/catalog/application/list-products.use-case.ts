import { Inject, Injectable } from '@nestjs/common';
import type { ProductSummaryDto } from '@mini-etsy/shared';
import {
  CATEGORY_REPOSITORY,
  PRODUCT_REPOSITORY,
  type CategoryRepository,
  type ProductRepository,
  type ProductSort,
} from '../domain/catalog.repositories.js';
import { CategoryNotFoundError } from '../domain/catalog.errors.js';
import { toProductSummaryDto } from './product.mapper.js';

export interface ListProductsInput {
  category?: string;
  q?: string;
  sort?: ProductSort;
  limit?: number;
}

export const DEFAULT_PRODUCT_LIMIT = 24;
export const MAX_PRODUCT_LIMIT = 100;

@Injectable()
export class ListProducts {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categories: CategoryRepository,
    @Inject(PRODUCT_REPOSITORY)
    private readonly products: ProductRepository,
  ) {}

  async execute(input: ListProductsInput = {}): Promise<ProductSummaryDto[]> {
    let categoryId: string | undefined;
    if (input.category) {
      const category = await this.categories.findBySlug(input.category);
      if (!category) throw new CategoryNotFoundError(input.category);
      categoryId = category.id;
    }

    const titleContains = input.q?.trim() || undefined;
    const limit = Math.min(
      input.limit ?? DEFAULT_PRODUCT_LIMIT,
      MAX_PRODUCT_LIMIT,
    );

    const products = await this.products.list({
      categoryId,
      titleContains,
      sort: input.sort ?? 'new',
      limit,
    });
    return products.map(toProductSummaryDto);
  }
}
