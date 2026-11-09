import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CartDto } from '@mini-etsy/shared';
import { api, ApiError } from '@/lib/api';
import { AddToCartButton } from './AddToCartButton';

vi.mock('@/lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api')>();
  return {
    ...actual,
    api: { addToCart: vi.fn() },
    announceCartChange: vi.fn(),
  };
});

const addToCart = vi.mocked(api.addToCart);
const cart: CartDto = { id: 'c1', lines: [], itemCount: 1, subtotalCents: 2800 };

function stepper() {
  return screen.getByRole('group', { name: 'Quantity' });
}

describe('AddToCartButton', () => {
  beforeEach(() => {
    addToCart.mockReset();
  });

  it('is disabled and says sold out when there is no stock', () => {
    render(<AddToCartButton productId="p1" stock={0} />);
    expect(screen.getByRole('button', { name: 'Sold out' })).toBeDisabled();
  });

  it('caps the quantity at the stock', async () => {
    render(<AddToCartButton productId="p1" stock={2} />);
    const plus = within(stepper()).getByRole('button', { name: 'Increase quantity' });
    const minus = within(stepper()).getByRole('button', { name: 'Decrease quantity' });

    expect(minus).toBeDisabled();
    await userEvent.click(plus);
    expect(within(stepper()).getByText('2')).toBeInTheDocument();
    expect(plus).toBeDisabled();
  });

  it('shows Adding… while saving, then Added', async () => {
    let resolve!: (value: CartDto) => void;
    addToCart.mockReturnValue(new Promise((r) => (resolve = r)));
    render(<AddToCartButton productId="p1" stock={5} />);

    await userEvent.click(within(stepper()).getByRole('button', { name: 'Increase quantity' }));
    await userEvent.click(screen.getByRole('button', { name: 'Add to cart' }));

    expect(addToCart).toHaveBeenCalledWith({ productId: 'p1', quantity: 2 });
    expect(screen.getByRole('button', { name: 'Adding…' })).toBeDisabled();

    resolve(cart);
    expect(await screen.findByRole('button', { name: 'Added to cart' })).toBeEnabled();
    expect(screen.getByRole('link', { name: /view cart/i })).toHaveAttribute('href', '/cart');
  });

  it('shows the API error and lets the shopper try again', async () => {
    addToCart.mockRejectedValueOnce(new ApiError(409, 'Only 1 of this item is in stock'));
    render(<AddToCartButton productId="p1" stock={5} />);

    await userEvent.click(screen.getByRole('button', { name: 'Add to cart' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Only 1 of this item is in stock');
    expect(screen.getByRole('button', { name: 'Add to cart' })).toBeEnabled();
  });
});
