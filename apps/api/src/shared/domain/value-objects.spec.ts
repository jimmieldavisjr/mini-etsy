import { ValidationError } from './domain-error.js';
import { Money } from './money.js';
import { Quantity } from './quantity.js';
import { Result } from './result.js';
import { Slug } from './slug.js';

describe('Money', () => {
  it('adds, multiplies and sums in whole cents', () => {
    const price = Money.fromCents(1250);
    expect(price.add(Money.fromCents(99)).cents).toBe(1349);
    expect(price.multiply(3).cents).toBe(3750);
    expect(Money.sum([price, price, Money.zero()]).cents).toBe(2500);
  });

  it('subtracts but never goes below zero', () => {
    expect(Money.fromCents(500).subtract(Money.fromCents(200)).cents).toBe(300);
    expect(() => Money.fromCents(100).subtract(Money.fromCents(101))).toThrow(
      ValidationError,
    );
  });

  it.each([-1, 1.5, Number.NaN, Number.POSITIVE_INFINITY])(
    'rejects %s cents',
    (cents) => {
      expect(() => Money.fromCents(cents)).toThrow(ValidationError);
      expect(Money.tryFromCents(cents).ok).toBe(false);
    },
  );

  it('rejects multiplying by a negative or fractional factor', () => {
    expect(() => Money.fromCents(100).multiply(-1)).toThrow(ValidationError);
    expect(() => Money.fromCents(100).multiply(0.5)).toThrow(ValidationError);
  });

  it('formats as dollars and compares by value', () => {
    expect(Money.fromCents(5).format()).toBe('$0.05');
    expect(Money.fromCents(123456).format()).toBe('$1234.56');
    expect(Money.fromCents(10).equals(Money.fromCents(10))).toBe(true);
    expect(JSON.stringify({ price: Money.fromCents(10) })).toBe('{"price":10}');
  });
});

describe('Quantity', () => {
  it('accepts whole numbers from 1 to 99', () => {
    expect(Quantity.of(1).value).toBe(1);
    expect(Quantity.of(99).value).toBe(99);
  });

  it.each([0, -3, 100, 2.5, Number.NaN])('rejects %s', (value) => {
    expect(() => Quantity.of(value)).toThrow(ValidationError);
  });

  it('adds up to the limit and no further', () => {
    expect(Quantity.of(40).add(Quantity.of(59)).value).toBe(99);
    expect(() => Quantity.of(50).add(Quantity.of(50))).toThrow(ValidationError);
  });

  it('compares against a stock level', () => {
    expect(Quantity.of(3).isMoreThan(2)).toBe(true);
    expect(Quantity.of(3).isMoreThan(3)).toBe(false);
  });
});

describe('Slug', () => {
  it('accepts lowercase words joined by single hyphens', () => {
    expect(Slug.of('home-and-living').value).toBe('home-and-living');
    expect(Slug.of('art2').value).toBe('art2');
  });

  it.each(['', 'Home', 'two--hyphens', '-leading', 'trailing-', 'has space', 'a'.repeat(81)])(
    'rejects "%s"',
    (value) => {
      expect(Slug.tryOf(value).ok).toBe(false);
    },
  );

  it('builds a slug from free text', () => {
    expect(Slug.fromText('Home & Living').value).toBe('home-and-living');
    expect(Slug.fromText('  Café Mugs, Set of 2! ').value).toBe(
      'cafe-mugs-set-of-2',
    );
  });
});

describe('Result', () => {
  it('unwraps a success and throws a failure', () => {
    expect(Result.unwrap(Result.ok(7))).toBe(7);
    const error = new ValidationError('nope');
    expect(() => Result.unwrap(Result.fail(error))).toThrow(error);
  });
});
