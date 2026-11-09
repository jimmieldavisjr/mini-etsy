import Link from 'next/link';
import { Suspense } from 'react';
import type { OrderStatus } from '@mini-etsy/shared';
import ui from '@/components/ui.module.css';
import { api } from '@/lib/api';
import { orNotFound } from '@/lib/or-not-found';
import { formatDate, formatPrice } from '@/lib/format';
import styles from './order.module.css';

const STEPS: OrderStatus[] = ['Pending', 'Paid', 'Shipped', 'Delivered'];

function StatusTracker({ status }: { status: OrderStatus }) {
  if (status === 'Cancelled') {
    return <p className={ui.error}>This order was cancelled.</p>;
  }
  const current = STEPS.indexOf(status);
  return (
    <ol className={styles.steps} aria-label="Order status">
      {STEPS.map((step, i) => (
        <li
          key={step}
          className={i <= current ? styles.stepDone : styles.step}
          aria-current={i === current ? 'step' : undefined}
        >
          {step}
        </li>
      ))}
    </ol>
  );
}

async function OrderSummary({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ placed?: string }>;
}) {
  const [{ id }, { placed }] = await Promise.all([params, searchParams]);
  const order = await orNotFound(api.getOrder(id));

  return (
    <>
      {placed && (
        <p className={ui.success} role="status">
          Thank you! Your order is placed. We sent the details to {order.email}{' '}
          (not really, this is a demo).
        </p>
      )}
      <h1>Order {order.id.slice(0, 8).toUpperCase()}</h1>
      <p className={ui.lead}>Placed {formatDate(order.createdAt)}</p>

      <StatusTracker status={order.status} />

      <div className={styles.columns}>
        <section className={ui.card} aria-labelledby="items-heading">
          <h2 id="items-heading">Items</h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Item</th>
                <th scope="col">Qty</th>
                <th scope="col" className={styles.num}>Price</th>
                <th scope="col" className={styles.num}>Total</th>
              </tr>
            </thead>
            <tbody>
              {order.lines.map((line) => (
                <tr key={line.productId}>
                  <td>{line.title}</td>
                  <td>{line.quantity}</td>
                  <td className={styles.num}>{formatPrice(line.unitPriceCents)}</td>
                  <td className={styles.num}>{formatPrice(line.lineTotalCents)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th scope="row" colSpan={3}>Order total</th>
                <td className={styles.num}>{formatPrice(order.totalCents)}</td>
              </tr>
            </tfoot>
          </table>
        </section>

        <section className={ui.card} aria-labelledby="ship-heading">
          <h2 id="ship-heading">Shipping to</h2>
          <p className={styles.address}>
            <strong>{order.shippingName}</strong>
            {'\n'}
            {order.shippingAddress}
          </p>
          <p className={ui.muted}>{order.email}</p>
        </section>
      </div>

      <p>
        <Link href="/" className={ui.buttonGhost}>
          Keep shopping
        </Link>
      </p>
    </>
  );
}

export default function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ placed?: string }>;
}) {
  return (
    <div className={ui.page}>
      <Suspense fallback={<p className={ui.muted}>Loading order…</p>}>
        <OrderSummary params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
