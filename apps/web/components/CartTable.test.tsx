import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { CartLineDto } from '@mini-etsy/shared';
import { CartSummary } from './CartSummary';
import { CartTable } from './CartTable';

function line(overrides: Partial<CartLineDto>): CartLineDto {
  return {
    productId: 'p1',
    slug: 'speckled-mug',
    title: 'Speckled Mug',
    shopName: 'Kiln Street Pottery',
    imageUrl: 'https://images.unsplash.com/photo-1',
    unitPriceCents: 2800,
    quantity: 1,
    lineTotalCents: 2800,
    stock: 10,
    available: true,
    ...overrides,
  };
}

const lines = [
  line({ productId: 'mug', title: 'Speckled Mug', unitPriceCents: 2800, quantity: 2 }),
  line({ productId: 'card', slug: 'fox-card', title: 'Fox Card', unitPriceCents: 450, quantity: 3 }),
];

describe('CartTable', () => {
  it('shows each line total', () => {
    render(<CartTable lines={lines} onQuantityChange={vi.fn()} onRemove={vi.fn()} />);

    expect(within(screen.getByTestId('line-mug')).getByText('$56.00')).toBeInTheDocument();
    expect(within(screen.getByTestId('line-card')).getByText('$13.50')).toBeInTheDocument();
    expect(within(screen.getByTestId('line-mug')).getByRole('img', { name: 'Speckled Mug' })).toBeInTheDocument();
  });

  it('steps the quantity up and down within the stock', async () => {
    const onQuantityChange = vi.fn();
    render(
      <CartTable
        lines={[line({ productId: 'mug', quantity: 4, stock: 4 })]}
        onQuantityChange={onQuantityChange}
        onRemove={vi.fn()}
      />,
    );

    const stepper = screen.getByRole('group', { name: 'Quantity for Speckled Mug' });
    expect(within(stepper).getByRole('button', { name: 'Increase quantity' })).toBeDisabled();

    await userEvent.click(within(stepper).getByRole('button', { name: 'Decrease quantity' }));
    expect(onQuantityChange).toHaveBeenCalledWith('mug', 3);
  });

  it('reports removals and disables controls while busy', async () => {
    const onRemove = vi.fn();
    const { rerender } = render(
      <CartTable lines={lines} onQuantityChange={vi.fn()} onRemove={onRemove} />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Remove Fox Card' }));
    expect(onRemove).toHaveBeenCalledWith('card');

    rerender(<CartTable lines={lines} onQuantityChange={vi.fn()} onRemove={onRemove} busy />);
    expect(screen.getByRole('button', { name: 'Remove Fox Card' })).toBeDisabled();
    const stepper = screen.getByRole('group', { name: 'Quantity for Speckled Mug' });
    expect(within(stepper).getByRole('button', { name: 'Decrease quantity' })).toBeDisabled();
  });

  it('flags lines that are gone or short on stock', () => {
    render(
      <CartTable
        lines={[
          line({ productId: 'gone', title: 'Gone Item', available: false }),
          line({ productId: 'short', title: 'Short Item', quantity: 5, stock: 2 }),
        ]}
        onQuantityChange={vi.fn()}
        onRemove={vi.fn()}
      />,
    );
    expect(screen.getByText(/No longer available/)).toBeInTheDocument();
    expect(screen.getByText(/Only 2 left in stock/)).toBeInTheDocument();
  });
});

describe('CartSummary', () => {
  it('totals the lines', () => {
    render(<CartSummary lines={lines} />);
    expect(screen.getByTestId('subtotal')).toHaveTextContent('$69.50');
    expect(screen.getByText('Subtotal (5 items)')).toBeInTheDocument();
  });

  it('leaves unavailable lines out of the totals', () => {
    render(
      <CartSummary
        lines={[...lines, line({ productId: 'gone', unitPriceCents: 9999, quantity: 1, available: false })]}
      />,
    );
    expect(screen.getByTestId('subtotal')).toHaveTextContent('$69.50');
    expect(screen.getByText('Subtotal (5 items)')).toBeInTheDocument();
  });
});
