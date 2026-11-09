'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { CartDto } from '@mini-etsy/shared';
import { api, CART_CHANGED_EVENT } from '@/lib/api';
import { BagIcon } from './icons';
import styles from './CartLink.module.css';

/** Header cart button with a live item count. */
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
    <Link
      href="/cart"
      className={styles.link}
      aria-label={count > 0 ? `Cart, ${count} ${count === 1 ? 'item' : 'items'}` : 'Cart'}
    >
      <span className={styles.icon}>
        <BagIcon size={22} />
        {count > 0 && (
          <span key={count} className={styles.badge} aria-hidden="true">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </span>
      <span className={styles.text}>Cart</span>
    </Link>
  );
}
