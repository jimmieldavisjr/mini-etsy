'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { CartDto } from '@mini-etsy/shared';
import { announceCartChange, api } from '@/lib/api';
import { CartSummary } from './CartSummary';
import { CartTable } from './CartTable';
import { ArrowRightIcon, BagIcon, ErrorCircleIcon } from './icons';
import ui from './ui.module.css';
import styles from './CartView.module.css';

/** Loads the cart and saves quantity changes and removals. */
export function CartView() {
  const [cart, setCart] = useState<CartDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api
      .getCart()
      .then(setCart)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Could not load your cart'));
  }, []);

  async function save(change: () => Promise<CartDto>) {
    setBusy(true);
    setError(null);
    try {
      const updated = await change();
      setCart(updated);
      announceCartChange(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not update your cart');
    } finally {
      setBusy(false);
    }
  }

  if (!cart) {
    return error ? (
      <p className={ui.infoError} role="alert">
        <ErrorCircleIcon size={18} />
        {error}
      </p>
    ) : (
      <div className={styles.layout} aria-busy="true">
        <div className={styles.skeletonLines} />
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
        <h2>Your cart is empty</h2>
        <p className={ui.muted}>Find something made by hand to fill it.</p>
        <Link href="/" className={`${ui.buttonAccent} ${ui.large}`}>
          Start browsing
        </Link>
      </div>
    );
  }

  const blocked = cart.lines.some((l) => !l.available || l.quantity > l.stock);

  return (
    <div className={styles.layout}>
      <div className={styles.lines}>
        {error && (
          <p className={ui.infoError} role="alert">
            <ErrorCircleIcon size={18} />
            {error}
          </p>
        )}
        <CartTable
          lines={cart.lines}
          busy={busy}
          onQuantityChange={(productId, quantity) =>
            save(() => api.updateCartItem(productId, { quantity }))
          }
          onRemove={(productId) => save(() => api.removeCartItem(productId))}
        />
        <Link href="/" className={ui.textLink}>
          ← Keep shopping
        </Link>
      </div>
      <CartSummary lines={cart.lines}>
        {blocked ? (
          <p className={ui.fieldError}>
            <ErrorCircleIcon size={14} /> Update the items marked above to check out.
          </p>
        ) : (
          <Link href="/checkout" className={`${ui.buttonAccent} ${ui.large} ${ui.block}`}>
            Proceed to checkout <ArrowRightIcon size={16} />
          </Link>
        )}
      </CartSummary>
    </div>
  );
}
