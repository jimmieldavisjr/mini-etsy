import {
  ConflictError,
  NotFoundError,
} from '../../../shared/domain/domain-error.js';

export class CartItemNotFoundError extends NotFoundError {
  constructor(productId: string) {
    super(`Product "${productId}" is not in the cart`);
  }
}

export class NotEnoughStockError extends ConflictError {
  constructor(readonly inStock: number) {
    super(
      inStock === 0
        ? 'This item is sold out'
        : `Only ${inStock} of this item ${inStock === 1 ? 'is' : 'are'} in stock`,
    );
  }
}

export class ProductUnavailableError extends NotFoundError {
  constructor(productId: string) {
    super(`Product "${productId}" is not available`);
  }
}
