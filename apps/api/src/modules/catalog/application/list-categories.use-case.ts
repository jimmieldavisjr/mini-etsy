import { Inject, Injectable } from '@nestjs/common';
import type { CategoryDto } from '@mini-etsy/shared';
import {
  CATEGORY_REPOSITORY,
  type CategoryRepository,
} from '../domain/catalog.repositories.js';
import { CategoryNotFoundError } from '../domain/catalog.errors.js';
import { toCategoryDto } from './product.mapper.js';

@Injectable()
export class ListCategories {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categories: CategoryRepository,
  ) {}

  async execute(): Promise<CategoryDto[]> {
    const rows = await this.categories.findAllWithCounts();
    return rows.map(toCategoryDto);
  }

  async bySlug(slug: string): Promise<CategoryDto> {
    const all = await this.categories.findAllWithCounts();
    const match = all.find((row) => row.category.slug.value === slug);
    if (!match) throw new CategoryNotFoundError(slug);
    return toCategoryDto(match);
  }
}
