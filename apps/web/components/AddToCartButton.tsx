'use client';

import Link from 'next/link';
import { useState } from 'react';
import { announceCartChange, api } from '@/lib/api';
import { MAX_LINE_QUANTITY } from '@/lib/cart';
import { BagIcon, CheckIcon, ErrorCircleIcon } from './icons';
import { QuantityStepper } from './QuantityStepper';
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
      <button type="button" className={`${ui.buttonAccent} ${ui.large} ${ui.block}`} disabled>
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
        <QuantityStepper
          label="Quantity"
          value={quantity}
          max={max}
          size="large"
          disabled={state.kind === 'adding'}
          onChange={(next) => {
            setQuantity(next);
            setState({ kind: 'idle' });
          }}
        />
        <button
          type="button"
          className={`${ui.buttonAccent} ${ui.large} ${styles.button}`}
          onClick={add}
          disabled={state.kind === 'adding'}
        >
          {state.kind === 'added' ? <CheckIcon size={18} /> : <BagIcon size={18} />}
          {state.kind === 'adding'
            ? 'Adding…'
            : state.kind === 'added'
              ? 'Added to cart'
              : 'Add to cart'}
        </button>
      </div>
      <div aria-live="polite">
        {state.kind === 'added' && (
          <p className={styles.message}>
            In your cart.{' '}
            <Link href="/cart" className={ui.textLink}>
              View cart and check out
            </Link>
          </p>
        )}
        {state.kind === 'error' && (
          <p className={ui.fieldError} role="alert">
            <ErrorCircleIcon size={16} />
            {state.message}
          </p>
        )}
      </div>
    </div>
  );
}
