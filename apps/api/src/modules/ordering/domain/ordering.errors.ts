import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from '../../../shared/domain/domain-error.js';
import type { OrderStatus } from './order-status.js';

export class OrderNotFoundError extends NotFoundError {
  constructor(id: string) {
    super(`Order "${id}" was not found`);
  }
}

export class InvalidStatusTransitionError extends ConflictError {
  constructor(from: OrderStatus, to: OrderStatus) {
    super(`An order cannot go from ${from} to ${to}`);
  }
}

export class EmptyCartError extends ValidationError {
  constructor() {
    super('Your cart is empty');
  }
}

export class EmptyOrderError extends ValidationError {
  constructor() {
    super('An order needs at least one line');
  }
}

/** One or more cart lines cannot be filled. Lists every problem at once. */
export class InsufficientStockError extends ConflictError {
  constructor(readonly problems: readonly string[]) {
    super(`Some items cannot be ordered: ${problems.join('; ')}`);
  }
}
