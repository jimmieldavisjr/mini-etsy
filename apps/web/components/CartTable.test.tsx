import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { CartLineDto } from '@mini-etsy/shared';
import { CartTable } from './CartTable';

function line(overrides: Partial<CartLineDto>): CartLineDto {
  return {
    productId: 'p1',
    slug: 'speckled-mug',
    title: 'Speckled Mug',
    shopName: 'Kiln Street Pottery',
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
  it('shows each line total and the subtotal', () => {
    render(<CartTable lines={lines} onQuantityChange={vi.fn()} onRemove={vi.fn()} />);

    expect(within(screen.getByTestId('line-mug')).getByText('$56.00')).toBeInTheDocument();
    expect(within(screen.getByTestId('line-card')).getByText('$13.50')).toBeInTheDocument();
    expect(screen.getByTestId('subtotal')).toHaveTextContent('$69.50');
    expect(screen.getByText('Subtotal (5 items)')).toBeInTheDocument();
  });

  it('leaves unavailable lines out of the subtotal', () => {
    render(
      <CartTable
        lines={[...lines, line({ productId: 'gone', title: 'Gone Item', unitPriceCents: 9999, available: false })]}
        onQuantityChange={vi.fn()}
        onRemove={vi.fn()}
      />,
    );

    expect(screen.getByTestId('subtotal')).toHaveTextContent('$69.50');
    expect(screen.getByText(/No longer available/)).toBeInTheDocument();
  });

  it('offers quantities up to the stock and reports changes', async () => {
    const onQuantityChange = vi.fn();
    render(
      <CartTable
        lines={[line({ productId: 'mug', quantity: 1, stock: 4 })]}
        onQuantityChange={onQuantityChange}
        onRemove={vi.fn()}
      />,
    );

    const select = screen.getByLabelText('Quantity for Speckled Mug');
    expect(within(select).getAllByRole('option')).toHaveLength(4);

    await userEvent.selectOptions(select, '3');
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
    expect(screen.getByLabelText('Quantity for Speckled Mug')).toBeDisabled();
  });
});
