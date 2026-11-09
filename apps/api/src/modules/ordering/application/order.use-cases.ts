import { Inject, Injectable } from '@nestjs/common';
import type { OrderDto } from '@mini-etsy/shared';
import type { OrderStatus } from '../domain/order-status.js';
import { ORDER_REPOSITORY, type OrderRepository } from '../domain/order.repository.js';
import { OrderNotFoundError } from '../domain/ordering.errors.js';
import { toOrderDto } from './order.mapper.js';

@Injectable()
export class GetOrder {
  constructor(
    @Inject(ORDER_REPOSITORY) private readonly orders: OrderRepository,
  ) {}

  async execute(id: string): Promise<OrderDto> {
    const order = await this.orders.findById(id);
    if (!order) throw new OrderNotFoundError(id);
    return toOrderDto(order);
  }
}

@Injectable()
export class ChangeStatus {
  constructor(
    @Inject(ORDER_REPOSITORY) private readonly orders: OrderRepository,
  ) {}

  async execute(id: string, next: OrderStatus): Promise<OrderDto> {
    const order = await this.orders.findById(id);
    if (!order) throw new OrderNotFoundError(id);
    order.changeStatus(next);
    await this.orders.updateStatus(order);
    return toOrderDto(order);
  }
}
