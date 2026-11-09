'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { CartDto } from '@mini-etsy/shared';
import { api } from '@/lib/api';
import { cartTotals, lineTotal } from '@/lib/cart';
import { formatPrice } from '@/lib/format';
import { CheckoutForm } from './CheckoutForm';
import ui from './ui.module.css';
import styles from './CheckoutPanel.module.css';

/** The checkout form beside a summary of what is being ordered. */
export function CheckoutPanel() {
  const [cart, setCart] = useState<CartDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getCart()
      .then(setCart)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Could not load your cart'));
  }, []);

  if (error) return <p className={ui.error} role="alert">{error}</p>;
  if (!cart) return <p className={ui.muted}>Loading…</p>;

  if (cart.lines.length === 0) {
    return (
      <div className={ui.card}>
        <p>Your cart is empty, so there is nothing to check out.</p>
        <Link href="/" className={ui.button}>Back to the shop</Link>
      </div>
    );
  }

  const { subtotalCents } = cartTotals(cart.lines);

  return (
    <div className={styles.columns}>
      <section className={ui.card} aria-labelledby="details-heading">
        <h2 id="details-heading">Your details</h2>
        <CheckoutForm />
      </section>
      <aside className={ui.card} aria-labelledby="summary-heading">
        <h2 id="summary-heading">Order summary</h2>
        <ul className={styles.lines}>
          {cart.lines.map((line) => (
            <li key={line.productId}>
              <span>
                {line.title} <span className={ui.muted}>× {line.quantity}</span>
              </span>
              <span>{formatPrice(lineTotal(line))}</span>
            </li>
          ))}
        </ul>
        <p className={styles.total}>
          <span>Total</span>
          <span>{formatPrice(subtotalCents)}</span>
        </p>
        <Link href="/cart">Edit cart</Link>
      </aside>
    </div>
  );
}
