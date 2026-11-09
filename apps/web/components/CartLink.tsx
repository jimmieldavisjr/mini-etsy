'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { CartDto } from '@mini-etsy/shared';
import { api, CART_CHANGED_EVENT } from '@/lib/api';
import styles from './CartLink.module.css';

/** Header cart link with a live item count. */
export function CartLink() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    api
      .getCart()
      .then((cart) => {
        if (!cancelled) setCount(cart.itemCount);
      })
      .catch(() => {
        // The count is a nicety; the cart page shows real errors.
      });

    const onChange = (event: Event) => {
      setCount((event as CustomEvent<CartDto>).detail.itemCount);
    };
    window.addEventListener(CART_CHANGED_EVENT, onChange);
    return () => {
      cancelled = true;
      window.removeEventListener(CART_CHANGED_EVENT, onChange);
    };
  }, []);

  return (
    <Link href="/cart" className={styles.link}>
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
        <path
          d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6.2"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="10" cy="20.5" r="1.3" fill="currentColor" />
        <circle cx="17" cy="20.5" r="1.3" fill="currentColor" />
      </svg>
      <span className={styles.text}>Cart</span>
      {count > 0 && (
        <span className={styles.badge} aria-label={`${count} items in cart`}>
          {count}
        </span>
      )}
    </Link>
  );
}
