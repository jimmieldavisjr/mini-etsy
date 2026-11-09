import { Module } from '@nestjs/common';
import { CatalogQueryService } from './application/catalog-query.service.js';
import { GetProduct } from './application/get-product.use-case.js';
import { ListCategories } from './application/list-categories.use-case.js';
import { ListProducts } from './application/list-products.use-case.js';
import {
  CATEGORY_REPOSITORY,
  PRODUCT_REPOSITORY,
} from './domain/catalog.repositories.js';
import { PrismaCategoryRepository } from './infrastructure/prisma-category.repository.js';
import { PrismaProductRepository } from './infrastructure/prisma-product.repository.js';
import { CatalogController } from './presentation/catalog.controller.js';

@Module({
  controllers: [CatalogController],
  providers: [
    { provide: CATEGORY_REPOSITORY, useClass: PrismaCategoryRepository },
    { provide: PRODUCT_REPOSITORY, useClass: PrismaProductRepository },
    ListCategories,
    ListProducts,
    GetProduct,
    CatalogQueryService,
  ],
  exports: [CatalogQueryService],
})
export class CatalogModule {}
