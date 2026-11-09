import Link from 'next/link';
import type { CartLineDto } from '@mini-etsy/shared';
import { cartTotals, lineTotal, maxQuantity } from '@/lib/cart';
import { formatPrice } from '@/lib/format';
import { ProductImage } from './ProductImage';
import ui from './ui.module.css';
import styles from './CartTable.module.css';

export interface CartTableProps {
  lines: CartLineDto[];
  onQuantityChange: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  /** Disables the controls while a change is saving. */
  busy?: boolean;
}

/** The cart's lines, with quantity controls and the subtotal. */
export function CartTable({ lines, onQuantityChange, onRemove, busy = false }: CartTableProps) {
  const { itemCount, subtotalCents } = cartTotals(lines);

  return (
    <table className={styles.table}>
      <caption className="visually-hidden">Items in your cart</caption>
      <thead>
        <tr>
          <th scope="col">Item</th>
          <th scope="col">Quantity</th>
          <th scope="col" className={styles.num}>Total</th>
        </tr>
      </thead>
      <tbody>
        {lines.map((line) => {
          // Keep the current quantity selectable even if stock dropped below it.
          const max = Math.max(maxQuantity(line), line.quantity);
          return (
            <tr key={line.productId} data-testid={`line-${line.productId}`}>
              <td>
                <div className={styles.item}>
                  <ProductImage slug={line.slug || line.productId} title={line.title} size="thumb" />
                  <div>
                    {line.available ? (
                      <Link href={`/p/${line.slug}`} className={styles.title}>
                        {line.title}
                      </Link>
                    ) : (
                      <span className={styles.title}>{line.title}</span>
                    )}
                    {line.shopName && <div className={ui.muted}>{line.shopName}</div>}
                    <div className={ui.muted}>{formatPrice(line.unitPriceCents)} each</div>
                    {!line.available && (
                      <div className={ui.fieldError}>No longer available. Please remove it.</div>
                    )}
                    {line.available && line.quantity > line.stock && (
                      <div className={ui.fieldError}>Only {line.stock} left in stock.</div>
                    )}
                  </div>
                </div>
              </td>
              <td>
                <div className={styles.controls}>
                  {line.available && (
                    <select
                      aria-label={`Quantity for ${line.title}`}
                      className={`${ui.input} ${styles.select}`}
                      value={line.quantity}
                      disabled={busy}
                      onChange={(e) => onQuantityChange(line.productId, Number(e.target.value))}
                    >
                      {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  )}
                  <button
                    type="button"
                    className={ui.linkButton}
                    disabled={busy}
                    onClick={() => onRemove(line.productId)}
                    aria-label={`Remove ${line.title}`}
                  >
                    Remove
                  </button>
                </div>
              </td>
              <td className={styles.num}>{formatPrice(lineTotal(line))}</td>
            </tr>
          );
        })}
      </tbody>
      <tfoot>
        <tr>
          <th scope="row" colSpan={2}>
            Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})
          </th>
          <td className={styles.num} data-testid="subtotal">
            {formatPrice(subtotalCents)}
          </td>
        </tr>
      </tfoot>
    </table>
  );
}
