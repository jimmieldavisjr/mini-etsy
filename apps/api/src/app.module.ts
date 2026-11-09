import { Module } from '@nestjs/common';
import { CartModule } from './modules/cart/index.js';
import { CatalogModule } from './modules/catalog/index.js';
import { OrderingModule } from './modules/ordering/index.js';
import { PrismaModule } from './shared/infrastructure/prisma.module.js';

/** Wires the modules together. New modules are added to this list. */
@Module({
  imports: [PrismaModule, CatalogModule, CartModule, OrderingModule],
})
export class AppModule {}
