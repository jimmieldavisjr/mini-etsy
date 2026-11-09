import { Module } from '@nestjs/common';
import { CartModule, CartQueryService } from '../cart/index.js';
import { CatalogModule, CatalogQueryService } from '../catalog/index.js';
import { Checkout } from './application/checkout.use-case.js';
import { ChangeStatus, GetOrder } from './application/order.use-cases.js';
import {
  CART_SOURCE,
  PRODUCT_PRICING,
  type CartSource,
  type ProductPricing,
} from './application/ports.js';
import { ORDER_REPOSITORY } from './domain/order.repository.js';
import { PrismaOrderRepository } from './infrastructure/prisma-order.repository.js';
import { OrdersController } from './presentation/orders.controller.js';

@Module({
  imports: [CatalogModule, CartModule],
  controllers: [OrdersController],
  providers: [
    { provide: ORDER_REPOSITORY, useClass: PrismaOrderRepository },
    {
      // Catalog's public service implements Ordering's ProductPricing port.
      provide: PRODUCT_PRICING,
      useFactory: (catalog: CatalogQueryService): ProductPricing => catalog,
      inject: [CatalogQueryService],
    },
    {
      provide: CART_SOURCE,
      useFactory: (cart: CartQueryService): CartSource => cart,
      inject: [CartQueryService],
    },
    Checkout,
    GetOrder,
    ChangeStatus,
  ],
})
export class OrderingModule {}
