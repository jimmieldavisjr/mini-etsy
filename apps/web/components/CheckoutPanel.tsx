'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { CartDto } from '@mini-etsy/shared';
import { api } from '@/lib/api';
import { CartSummary } from './CartSummary';
import { CheckoutForm } from './CheckoutForm';
import { BagIcon, ErrorCircleIcon } from './icons';
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

  if (error) {
    return (
      <p className={ui.infoError} role="alert">
        <ErrorCircleIcon size={18} />
        {error}
      </p>
    );
  }
  if (!cart) {
    return (
      <div className={styles.columns} aria-busy="true">
        <div className={styles.skeletonForm} />
        <div className={styles.skeletonSummary} />
      </div>
    );
  }

  if (cart.lines.length === 0) {
    return (
      <div className={`${ui.cardPadded} ${styles.empty}`}>
        <span className={styles.emptyIcon}>
          <BagIcon size={28} />
        </span>
        <h2>Nothing to check out yet</h2>
        <p className={ui.muted}>Your cart is empty.</p>
        <Link href="/" className={`${ui.buttonAccent} ${ui.large}`}>
          Back to the shop
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.columns}>
      <section className={ui.cardPadded} aria-label="Your details">
        <CheckoutForm />
      </section>
      <CartSummary lines={cart.lines} showItems>
        <Link href="/cart" className={`${ui.buttonStandard} ${ui.block}`}>
          Edit cart
        </Link>
      </CartSummary>
    </div>
  );
}
