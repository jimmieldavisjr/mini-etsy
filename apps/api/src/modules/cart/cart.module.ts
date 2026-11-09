import { Module } from '@nestjs/common';
import { CatalogModule, CatalogQueryService } from '../catalog/index.js';
import { CartQueryService } from './application/cart-query.service.js';
import {
  AddItem,
  GetCart,
  RemoveItem,
  UpdateQuantity,
} from './application/cart.use-cases.js';
import {
  PRODUCT_LOOKUP,
  type ProductLookup,
} from './application/product-lookup.port.js';
import { CART_REPOSITORY } from './domain/cart.repository.js';
import { PrismaCartRepository } from './infrastructure/prisma-cart.repository.js';
import { CartController } from './presentation/cart.controller.js';

@Module({
  imports: [CatalogModule],
  controllers: [CartController],
  providers: [
    { provide: CART_REPOSITORY, useClass: PrismaCartRepository },
    {
      // Catalog's public service satisfies Cart's port; the type checks that here.
      provide: PRODUCT_LOOKUP,
      useFactory: (catalog: CatalogQueryService): ProductLookup => catalog,
      inject: [CatalogQueryService],
    },
    GetCart,
    AddItem,
    UpdateQuantity,
    RemoveItem,
    CartQueryService,
  ],
  exports: [CartQueryService],
})
export class CartModule {}
