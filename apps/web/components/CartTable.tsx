import Link from 'next/link';
import type { CartLineDto } from '@mini-etsy/shared';
import { lineTotal, maxQuantity } from '@/lib/cart';
import { formatPrice } from '@/lib/format';
import { ErrorCircleIcon, TrashIcon } from './icons';
import { Photo } from './Photo';
import { QuantityStepper } from './QuantityStepper';
import ui from './ui.module.css';
import styles from './CartTable.module.css';

export interface CartTableProps {
  lines: CartLineDto[];
  onQuantityChange: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  /** Disables the controls while a change is saving. */
  busy?: boolean;
}

/** The cart's lines, each with a photo, quantity stepper and line total. */
export function CartTable({ lines, onQuantityChange, onRemove, busy = false }: CartTableProps) {
  return (
    <ul className={styles.list} aria-label="Items in your cart">
      {lines.map((line) => {
        // Keep the current quantity reachable even if stock dropped below it.
        const max = Math.max(maxQuantity(line), line.quantity);
        const short = line.available && line.quantity > line.stock;
        return (
          <li key={line.productId} className={styles.line} data-testid={`line-${line.productId}`}>
            <Photo
              src={line.imageUrl}
              alt={line.title}
              sizes="112px"
              className={`${styles.photo} ${line.available ? '' : styles.unavailable}`}
            />
            <div className={styles.info}>
              {line.shopName && <p className={styles.shop}>{line.shopName}</p>}
              {line.available ? (
                <Link href={`/p/${line.slug}`} className={styles.title}>
                  {line.title}
                </Link>
              ) : (
                <span className={styles.title}>{line.title}</span>
              )}
              <p className={ui.small}>{formatPrice(line.unitPriceCents)} each</p>
              {!line.available && (
                <p className={ui.fieldError}>
                  <ErrorCircleIcon size={14} /> No longer available. Please remove it.
                </p>
              )}
              {short && (
                <p className={ui.fieldError}>
                  <ErrorCircleIcon size={14} /> Only {line.stock} left in stock.
                </p>
              )}
              <div className={styles.controls}>
                {line.available && (
                  <QuantityStepper
                    label={`Quantity for ${line.title}`}
                    value={line.quantity}
                    max={max}
                    disabled={busy}
                    onChange={(next) => onQuantityChange(line.productId, next)}
                  />
                )}
                <button
                  type="button"
                  className={styles.remove}
                  disabled={busy}
                  onClick={() => onRemove(line.productId)}
                  aria-label={`Remove ${line.title}`}
                >
                  <TrashIcon size={16} />
                  <span>Remove</span>
                </button>
              </div>
            </div>
            <p className={styles.total}>{formatPrice(lineTotal(line))}</p>
          </li>
        );
      })}
    </ul>
  );
}
