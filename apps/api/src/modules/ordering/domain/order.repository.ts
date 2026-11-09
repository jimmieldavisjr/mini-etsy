import type { Order } from './order.js';

export interface OrderRepository {
  findById(id: string): Promise<Order | null>;
  /** Inserts a new order with its lines. */
  create(order: Order): Promise<void>;
  /** Saves a status change. */
  updateStatus(order: Order): Promise<void>;
}

export const ORDER_REPOSITORY = Symbol('OrderRepository');
