import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/infrastructure/prisma.service.js';
import { Order } from '../domain/order.js';
import type { OrderRepository } from '../domain/order.repository.js';

@Injectable()
export class PrismaOrderRepository implements OrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Order | null> {
    const row = await this.prisma.db.order.findUnique({
      where: { id },
      include: { lines: { orderBy: { id: 'asc' } } },
    });
    return row ? Order.restore(row) : null;
  }

  async create(order: Order): Promise<void> {
    await this.prisma.db.order.create({
      data: {
        id: order.id,
        status: order.status,
        totalCents: order.total.cents,
        email: order.shipping.email,
        shippingName: order.shipping.shippingName,
        shippingAddress: order.shipping.shippingAddress,
        createdAt: order.createdAt,
        lines: {
          create: order.lines.map((line) => ({
            productId: line.productId,
            titleSnapshot: line.titleSnapshot,
            imageSnapshot: line.imageSnapshot,
            unitPriceCents: line.unitPrice.cents,
            quantity: line.quantity.value,
          })),
        },
      },
    });
  }

  async updateStatus(order: Order): Promise<void> {
    await this.prisma.db.order.update({
      where: { id: order.id },
      data: { status: order.status },
    });
  }
}
