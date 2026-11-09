import { Inject, Injectable } from '@nestjs/common';
import {
  PRODUCT_REPOSITORY,
  type ProductRepository,
} from '../domain/catalog.repositories.js';

/** What other modules may know about a product. Plain data, no domain types. */
export interface ProductSnapshot {
  id: string;
  slug: string;
  title: string;
  shopName: string;
  imageUrl: string | null;
  priceCents: number;
  stock: number;
  active: boolean;
}

/**
 * Catalog's public service, exported through the module's index.ts. Cart and
 * Ordering reach the catalog only through this class, bound to ports they
 * define themselves (ProductLookup, ProductPricing).
 */
@Injectable()
export class CatalogQueryService {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly products: ProductRepository,
  ) {}

  async findProducts(ids: readonly string[]): Promise<ProductSnapshot[]> {
    if (ids.length === 0) return [];
    const products = await this.products.findByIds([...new Set(ids)]);
    return products.map((p) => ({
      id: p.id,
      slug: p.slug.value,
      title: p.title,
      shopName: p.shopName,
      imageUrl: p.imageUrl,
      priceCents: p.price.cents,
      stock: p.stock,
      active: p.active,
    }));
  }

  /** Lowers stock if enough is left. Returns false, changing nothing, if not. */
  reserveStock(productId: string, quantity: number): Promise<boolean> {
    return this.products.decrementStock(productId, quantity);
  }
}
