import { Controller, Get, Param, Query } from '@nestjs/common';
import type {
  CategoryDto,
  ProductDetailDto,
  ProductSummaryDto,
} from '@mini-etsy/shared';
import { GetProduct } from '../application/get-product.use-case.js';
import { ListCategories } from '../application/list-categories.use-case.js';
import { ListProducts } from '../application/list-products.use-case.js';
import { ListProductsQuery } from './list-products.query.js';

@Controller()
export class CatalogController {
  constructor(
    private readonly listCategories: ListCategories,
    private readonly listProducts: ListProducts,
    private readonly getProduct: GetProduct,
  ) {}

  @Get('categories')
  categories(): Promise<CategoryDto[]> {
    return this.listCategories.execute();
  }

  @Get('categories/:slug')
  category(@Param('slug') slug: string): Promise<CategoryDto> {
    return this.listCategories.bySlug(slug);
  }

  @Get('products')
  products(@Query() query: ListProductsQuery): Promise<ProductSummaryDto[]> {
    return this.listProducts.execute(query);
  }

  @Get('products/:slug')
  product(@Param('slug') slug: string): Promise<ProductDetailDto> {
    return this.getProduct.execute(slug);
  }
}
