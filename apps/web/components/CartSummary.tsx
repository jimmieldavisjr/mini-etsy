import type { CartLineDto } from '@mini-etsy/shared';
import { cartTotals, lineTotal } from '@/lib/cart';
import { formatPrice } from '@/lib/format';
import { LockIcon } from './icons';
import { Photo } from './Photo';
import ui from './ui.module.css';
import styles from './CartSummary.module.css';

/** Totals for the lines that can still be bought, plus the next action. */
export function CartSummary({
  lines,
  showItems = false,
  children,
}: {
  lines: CartLineDto[];
  /** Lists each item with its photo, as on the checkout page. */
  showItems?: boolean;
  /** The call to action, such as a checkout link. */
  children?: React.ReactNode;
}) {
  const { itemCount, subtotalCents } = cartTotals(lines);
  return (
    <aside className={styles.summary} aria-labelledby="summary-heading">
      <h2 id="summary-heading" className={styles.heading}>
        Order summary
      </h2>
      {showItems && (
        <ul className={styles.items}>
          {lines
            .filter((l) => l.available)
            .map((line) => (
              <li key={line.productId}>
                <span className={styles.thumb}>
                  <Photo src={line.imageUrl} alt="" sizes="56px" className={styles.thumbPhoto} />
                  <span className={styles.qty}>{line.quantity}</span>
                </span>
                <span className={styles.itemText}>
                  <span className={styles.itemTitle}>{line.title}</span>
                  <span className={ui.small}>{line.shopName}</span>
                </span>
                <span className={styles.itemPrice}>{formatPrice(lineTotal(line))}</span>
              </li>
            ))}
        </ul>
      )}
      <dl className={styles.rows}>
        <div>
          <dt>
            Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})
          </dt>
          <dd data-testid="subtotal">{formatPrice(subtotalCents)}</dd>
        </div>
        <div>
          <dt>Gift wrapping</dt>
          <dd>Included</dd>
        </div>
      </dl>
      <div className={styles.total}>
        <span>Total</span>
        <span>{formatPrice(subtotalCents)}</span>
      </div>
      {children}
      <p className={`${ui.small} ${styles.note}`}>
        <LockIcon size={14} /> Demo checkout. No payment is taken.
      </p>
    </aside>
  );
}
