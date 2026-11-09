import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/infrastructure/prisma.service.js';
import { Cart } from '../domain/cart.js';
import type { CartRepository } from '../domain/cart.repository.js';

@Injectable()
export class PrismaCartRepository implements CartRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Cart | null> {
    const row = await this.prisma.db.cart.findUnique({
      where: { id },
      include: { items: { orderBy: { addedAt: 'asc' } } },
    });
    return row ? Cart.restore(row) : null;
  }

  save(cart: Cart): Promise<void> {
    // Joins the caller's transaction if there is one, else opens its own.
    return this.prisma.run(async () => {
      const db = this.prisma.db;
      await db.cart.upsert({
        where: { id: cart.id },
        create: { id: cart.id, createdAt: cart.createdAt },
        update: { updatedAt: new Date() },
      });

      const items = cart.items;
      await db.cartItem.deleteMany({
        where: {
          cartId: cart.id,
          productId: { notIn: items.map((i) => i.productId) },
        },
      });
      for (const item of items) {
        await db.cartItem.upsert({
          where: {
            cartId_productId: { cartId: cart.id, productId: item.productId },
          },
          create: {
            cartId: cart.id,
            productId: item.productId,
            quantity: item.quantity.value,
          },
          update: { quantity: item.quantity.value },
        });
      }
    });
  }
}
