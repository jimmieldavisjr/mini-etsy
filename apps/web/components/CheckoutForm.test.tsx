import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { OrderDto } from '@mini-etsy/shared';
import { api, ApiError } from '@/lib/api';
import { CheckoutForm, validateCheckout } from './CheckoutForm';

const push = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));

vi.mock('@/lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api')>();
  return { ...actual, api: { checkout: vi.fn() }, announceCartChange: vi.fn() };
});

const checkout = vi.mocked(api.checkout);

async function fill(email: string, name: string, address: string) {
  if (email) await userEvent.type(screen.getByLabelText('Email'), email);
  if (name) await userEvent.type(screen.getByLabelText('Full name'), name);
  if (address) await userEvent.type(screen.getByLabelText('Shipping address'), address);
}

describe('validateCheckout', () => {
  it('accepts complete details', () => {
    expect(
      validateCheckout({ email: 'a@example.com', shippingName: 'Sam', shippingAddress: '1 Main St' }),
    ).toEqual({});
  });

  it('flags each missing or bad field', () => {
    const errors = validateCheckout({ email: 'nope', shippingName: ' ', shippingAddress: 'x' });
    expect(Object.keys(errors).sort()).toEqual(['email', 'shippingAddress', 'shippingName']);
  });
});

describe('CheckoutForm', () => {
  beforeEach(() => {
    checkout.mockReset();
    push.mockReset();
  });

  it('shows every error and does not submit an empty form', async () => {
    render(<CheckoutForm />);
    await userEvent.click(screen.getByRole('button', { name: 'Place order' }));

    expect(screen.getByText('Enter your email.')).toBeInTheDocument();
    expect(screen.getByText('Enter the name to ship to.')).toBeInTheDocument();
    expect(screen.getByText('Enter a full shipping address.')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
    expect(checkout).not.toHaveBeenCalled();
  });

  it('rejects a malformed email', async () => {
    render(<CheckoutForm />);
    await fill('buyer@example', 'Sam Buyer', '1 Example Street');
    await userEvent.click(screen.getByRole('button', { name: 'Place order' }));

    expect(screen.getByText(/Enter a valid email/)).toBeInTheDocument();
    expect(checkout).not.toHaveBeenCalled();
  });

  it('clears a field error as the shopper fixes it', async () => {
    render(<CheckoutForm />);
    await userEvent.click(screen.getByRole('button', { name: 'Place order' }));
    await userEvent.type(screen.getByLabelText('Email'), 'b');

    expect(screen.queryByText('Enter your email.')).not.toBeInTheDocument();
  });

  it('submits trimmed details and opens the order page', async () => {
    checkout.mockResolvedValue({ id: 'order-123' } as OrderDto);
    render(<CheckoutForm />);
    await fill('  buyer@example.com ', 'Sam Buyer ', '1 Example Street');
    await userEvent.click(screen.getByRole('button', { name: 'Place order' }));

    expect(checkout).toHaveBeenCalledWith({
      email: 'buyer@example.com',
      shippingName: 'Sam Buyer',
      shippingAddress: '1 Example Street',
    });
    expect(push).toHaveBeenCalledWith('/orders/order-123?placed=1');
  });

  it('shows a server error, such as short stock', async () => {
    checkout.mockRejectedValue(new ApiError(409, 'Some items cannot be ordered: Fox Card is sold out'));
    render(<CheckoutForm />);
    await fill('buyer@example.com', 'Sam Buyer', '1 Example Street');
    await userEvent.click(screen.getByRole('button', { name: 'Place order' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Fox Card is sold out');
    expect(screen.getByRole('button', { name: 'Place order' })).toBeEnabled();
    expect(push).not.toHaveBeenCalled();
  });
});
