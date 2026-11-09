'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { CartDto } from '@mini-etsy/shared';
import { announceCartChange, api } from '@/lib/api';
import { CartTable } from './CartTable';
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
      <p className={ui.error} role="alert">{error}</p>
    ) : (
      <p className={ui.muted}>Loading your cart…</p>
    );
  }

  if (cart.lines.length === 0) {
    return (
      <div className={ui.card}>
        <p>Your cart is empty.</p>
        <Link href="/" className={ui.button}>
          Discover something handmade
        </Link>
      </div>
    );
  }

  const blocked = cart.lines.some((l) => !l.available || l.quantity > l.stock);

  return (
    <>
      {error && (
        <p className={ui.error} role="alert">
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
      <div className={styles.actions}>
        <Link href="/" className={ui.buttonGhost}>
          Keep shopping
        </Link>
        {blocked ? (
          <span className={ui.muted}>Fix the items above to check out.</span>
        ) : (
          <Link href="/checkout" className={ui.button}>
            Proceed to checkout
          </Link>
        )}
      </div>
    </>
  );
}
