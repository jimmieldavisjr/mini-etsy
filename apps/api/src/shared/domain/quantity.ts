import { ValidationError } from './domain-error.js';
import { Result } from './result.js';

/** How many of one item: a whole number from 1 to 99. */
export class Quantity {
  static readonly MIN = 1;
  static readonly MAX = 99;

  private constructor(readonly value: number) {}

  static of(value: number): Quantity {
    return Result.unwrap(Quantity.tryOf(value));
  }

  static tryOf(value: number): Result<Quantity, ValidationError> {
    if (
      !Number.isInteger(value) ||
      value < Quantity.MIN ||
      value > Quantity.MAX
    ) {
      return Result.fail(
        new ValidationError(
          `Quantity must be a whole number from ${Quantity.MIN} to ${Quantity.MAX} (got ${value})`,
        ),
      );
    }
    return Result.ok(new Quantity(value));
  }

  add(other: Quantity): Quantity {
    return Quantity.of(this.value + other.value);
  }

  isMoreThan(limit: number): boolean {
    return this.value > limit;
  }

  equals(other: Quantity): boolean {
    return this.value === other.value;
  }

  toJSON(): number {
    return this.value;
  }
}
