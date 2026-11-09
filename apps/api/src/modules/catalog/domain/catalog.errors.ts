import { NotFoundError } from '../../../shared/domain/domain-error.js';

export class CategoryNotFoundError extends NotFoundError {
  constructor(slug: string) {
    super(`Category "${slug}" was not found`);
  }
}

export class ProductNotFoundError extends NotFoundError {
  constructor(slugOrId: string) {
    super(`Product "${slugOrId}" was not found`);
  }
}
