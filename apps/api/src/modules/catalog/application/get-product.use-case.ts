import { Inject, Injectable } from '@nestjs/common';
import type { ProductDetailDto } from '@mini-etsy/shared';
import {
  PRODUCT_REPOSITORY,
  type ProductRepository,
} from '../domain/catalog.repositories.js';
import { ProductNotFoundError } from '../domain/catalog.errors.js';
import { toProductDetailDto } from './product.mapper.js';

@Injectable()
export class GetProduct {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly products: ProductRepository,
  ) {}

  async execute(slug: string): Promise<ProductDetailDto> {
    const product = await this.products.findBySlug(slug);
    if (!product) throw new ProductNotFoundError(slug);
    return toProductDetailDto(product);
  }
}
