import { Quantity } from '../../../shared/domain/quantity.js';
import { ValidationError } from '../../../shared/domain/domain-error.js';
import { Cart } from './cart.js';
import { CartItemNotFoundError, NotEnoughStockError } from './cart.errors.js';

describe('Cart', () => {
  it('starts empty with a generated id', () => {
    const cart = Cart.create();
    expect(cart.isEmpty).toBe(true);
    expect(cart.id).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('merges a re-added product into one line', () => {
    const cart = Cart.create();
    cart.addItem('p1', Quantity.of(2), 10);
    cart.addItem('p1', Quantity.of(3), 10);
    cart.addItem('p2', Quantity.of(1), 10);

    expect(cart.items).toHaveLength(2);
    expect(cart.quantityOf('p1')?.value).toBe(5);
    expect(cart.quantityOf('p2')?.value).toBe(1);
  });

  it('rejects adding more than is in stock, counting what is already in the cart', () => {
    const cart = Cart.create();
    cart.addItem('p1', Quantity.of(2), 3);
    expect(() => cart.addItem('p1', Quantity.of(2), 3)).toThrow(
      NotEnoughStockError,
    );
    expect(cart.quantityOf('p1')?.value).toBe(2);
  });

  it('rejects a merged quantity over 99', () => {
    const cart = Cart.create();
    cart.addItem('p1', Quantity.of(60), 500);
    expect(() => cart.addItem('p1', Quantity.of(40), 500)).toThrow(
      ValidationError,
    );
  });

  it('sets a quantity and removes a line', () => {
    const cart = Cart.create();
    cart.addItem('p1', Quantity.of(1), 5);
    cart.setQuantity('p1', Quantity.of(4), 5);
    expect(cart.quantityOf('p1')?.value).toBe(4);

    cart.removeItem('p1');
    expect(cart.isEmpty).toBe(true);
  });

  it('refuses to change a product that is not in the cart', () => {
    const cart = Cart.create();
    expect(() => cart.setQuantity('nope', Quantity.of(1), 5)).toThrow(
      CartItemNotFoundError,
    );
    expect(() => cart.removeItem('nope')).toThrow(CartItemNotFoundError);
  });
});
