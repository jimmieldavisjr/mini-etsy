import { ValidationError } from './domain-error.js';
import { Result } from './result.js';

/** An amount of money in whole cents. Never negative. */
export class Money {
  private constructor(readonly cents: number) {}

  static fromCents(cents: number): Money {
    return Result.unwrap(Money.tryFromCents(cents));
  }

  static tryFromCents(cents: number): Result<Money, ValidationError> {
    if (!Number.isSafeInteger(cents) || cents < 0) {
      return Result.fail(
        new ValidationError(
          `Money must be a whole, non-negative number of cents (got ${cents})`,
        ),
      );
    }
    return Result.ok(new Money(cents));
  }

  static zero(): Money {
    return new Money(0);
  }

  static sum(amounts: readonly Money[]): Money {
    return amounts.reduce((total, m) => total.add(m), Money.zero());
  }

  add(other: Money): Money {
    return Money.fromCents(this.cents + other.cents);
  }

  subtract(other: Money): Money {
    if (other.cents > this.cents) {
      throw new ValidationError('Money cannot go below zero');
    }
    return new Money(this.cents - other.cents);
  }

  multiply(factor: number): Money {
    if (!Number.isInteger(factor) || factor < 0) {
      throw new ValidationError(
        `Money can only be multiplied by a whole, non-negative number (got ${factor})`,
      );
    }
    return Money.fromCents(this.cents * factor);
  }

  equals(other: Money): boolean {
    return this.cents === other.cents;
  }

  /** Formats as US dollars, for example "$12.50". */
  format(): string {
    return `$${(this.cents / 100).toFixed(2)}`;
  }

  toJSON(): number {
    return this.cents;
  }
}
