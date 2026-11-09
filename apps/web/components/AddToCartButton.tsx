'use client';

import Link from 'next/link';
import { useState } from 'react';
import { announceCartChange, api } from '@/lib/api';
import { MAX_LINE_QUANTITY } from '@/lib/cart';
import ui from './ui.module.css';
import styles from './AddToCartButton.module.css';

type State =
  | { kind: 'idle' }
  | { kind: 'adding' }
  | { kind: 'added' }
  | { kind: 'error'; message: string };

export function AddToCartButton({
  productId,
  stock,
}: {
  productId: string;
  stock: number;
}) {
  const [quantity, setQuantity] = useState(1);
  const [state, setState] = useState<State>({ kind: 'idle' });

  if (stock <= 0) {
    return (
      <button type="button" className={ui.button} disabled>
        Sold out
      </button>
    );
  }

  const max = Math.min(stock, MAX_LINE_QUANTITY);

  async function add() {
    setState({ kind: 'adding' });
    try {
      const cart = await api.addToCart({ productId, quantity });
      announceCartChange(cart);
      setState({ kind: 'added' });
    } catch (error) {
      setState({
        kind: 'error',
        message: error instanceof Error ? error.message : 'Could not add to cart',
      });
    }
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.row}>
        <label className={styles.qty}>
          <span className="visually-hidden">Quantity</span>
          <select
            className={ui.input}
            value={quantity}
            onChange={(e) => {
              setQuantity(Number(e.target.value));
              setState({ kind: 'idle' });
            }}
            disabled={state.kind === 'adding'}
          >
            {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className={`${ui.button} ${styles.button}`}
          onClick={add}
          disabled={state.kind === 'adding'}
        >
          {state.kind === 'adding'
            ? 'Adding…'
            : state.kind === 'added'
              ? 'Added to cart ✓'
              : 'Add to cart'}
        </button>
      </div>
      <div aria-live="polite">
        {state.kind === 'added' && (
          <p className={styles.message}>
            <Link href="/cart">View cart and check out</Link>
          </p>
        )}
        {state.kind === 'error' && (
          <p className={ui.fieldError} role="alert">
            {state.message}
          </p>
        )}
      </div>
    </div>
  );
}
