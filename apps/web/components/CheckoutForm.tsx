'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import type { CheckoutRequest } from '@mini-etsy/shared';
import { announceCartChange, api } from '@/lib/api';
import ui from './ui.module.css';
import styles from './CheckoutForm.module.css';

export type CheckoutErrors = Partial<Record<keyof CheckoutRequest, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Mirrors the API's checks, so most mistakes are caught before sending. */
export function validateCheckout(values: CheckoutRequest): CheckoutErrors {
  const errors: CheckoutErrors = {};
  if (!values.email.trim()) errors.email = 'Enter your email.';
  else if (!EMAIL_PATTERN.test(values.email.trim())) errors.email = 'Enter a valid email, like you@example.com.';
  if (!values.shippingName.trim()) errors.shippingName = 'Enter the name to ship to.';
  if (values.shippingAddress.trim().length < 5) errors.shippingAddress = 'Enter a full shipping address.';
  return errors;
}

const EMPTY: CheckoutRequest = { email: '', shippingName: '', shippingAddress: '' };

export function CheckoutForm() {
  const router = useRouter();
  const [values, setValues] = useState<CheckoutRequest>(EMPTY);
  const [errors, setErrors] = useState<CheckoutErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  function update(field: keyof CheckoutRequest, value: string) {
    setValues((v) => ({ ...v, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validateCheckout(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    setServerError(null);
    try {
      const order = await api.checkout({
        email: values.email.trim(),
        shippingName: values.shippingName.trim(),
        shippingAddress: values.shippingAddress.trim(),
      });
      announceCartChange({ id: null, lines: [], itemCount: 0, subtotalCents: 0 });
      router.push(`/orders/${order.id}?placed=1`);
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Could not place your order');
      setSubmitting(false);
    }
  }

  const fieldProps = (field: keyof CheckoutRequest) => ({
    id: field,
    name: field,
    value: values[field],
    className: ui.input,
    'aria-invalid': errors[field] ? true : undefined,
    'aria-describedby': errors[field] ? `${field}-error` : undefined,
  });

  const fieldError = (field: keyof CheckoutRequest) =>
    errors[field] && (
      <p id={`${field}-error`} className={ui.fieldError}>
        {errors[field]}
      </p>
    );

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      {serverError && (
        <p className={ui.error} role="alert">
          {serverError}
        </p>
      )}

      <div className={ui.field}>
        <label htmlFor="email" className={ui.label}>Email</label>
        <input
          {...fieldProps('email')}
          type="email"
          autoComplete="email"
          onChange={(e) => update('email', e.target.value)}
        />
        {fieldError('email')}
      </div>

      <div className={ui.field}>
        <label htmlFor="shippingName" className={ui.label}>Full name</label>
        <input
          {...fieldProps('shippingName')}
          autoComplete="name"
          onChange={(e) => update('shippingName', e.target.value)}
        />
        {fieldError('shippingName')}
      </div>

      <div className={ui.field}>
        <label htmlFor="shippingAddress" className={ui.label}>Shipping address</label>
        <textarea
          {...fieldProps('shippingAddress')}
          rows={4}
          autoComplete="street-address"
          onChange={(e) => update('shippingAddress', e.target.value)}
        />
        {fieldError('shippingAddress')}
      </div>

      <p className={ui.muted}>This is a demo. No payment is taken and nothing ships.</p>

      <button type="submit" className={ui.button} disabled={submitting}>
        {submitting ? 'Placing order…' : 'Place order'}
      </button>
    </form>
  );
}
