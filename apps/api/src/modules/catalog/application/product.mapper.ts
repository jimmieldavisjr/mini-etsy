import type {
  CategoryDto,
  ProductDetailDto,
  ProductSummaryDto,
} from '@mini-etsy/shared';
import type { CategoryWithCount } from '../domain/category.js';
import type { Product } from '../domain/product.js';

export function toCategoryDto({
  category,
  productCount,
}: CategoryWithCount): CategoryDto {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug.value,
    productCount,
  };
}

export function toProductSummaryDto(product: Product): ProductSummaryDto {
  return {
    id: product.id,
    title: product.title,
    slug: product.slug.value,
    priceCents: product.price.cents,
    stock: product.stock,
    shopName: product.shopName,
    categorySlug: product.category.slug,
  };
}

export function toProductDetailDto(product: Product): ProductDetailDto {
  return {
    ...toProductSummaryDto(product),
    description: product.description,
    categoryName: product.category.name,
  };
}
