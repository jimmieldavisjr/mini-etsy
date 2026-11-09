import Link from 'next/link';
import { Suspense } from 'react';
import type { OrderStatus } from '@mini-etsy/shared';
import { CheckCircleIcon, CheckIcon, ErrorCircleIcon } from '@/components/icons';
import { Photo } from '@/components/Photo';
import ui from '@/components/ui.module.css';
import { api } from '@/lib/api';
import { formatDate, formatPrice } from '@/lib/format';
import { orNotFound } from '@/lib/or-not-found';
import styles from './order.module.css';

const STEPS: OrderStatus[] = ['Pending', 'Paid', 'Shipped', 'Delivered'];

const STEP_HINT: Record<OrderStatus, string> = {
  Pending: 'Order received',
  Paid: 'Payment confirmed',
  Shipped: 'On its way',
  Delivered: 'Arrived',
  Cancelled: 'Cancelled',
};

function StatusPill({ status }: { status: OrderStatus }) {
  const cls =
    status === 'Cancelled'
      ? ui.pillNeutral
      : status === 'Delivered'
        ? ui.pillSuccess
        : ui.pillAccent;
  return <span className={cls}>{status}</span>;
}

function StatusTracker({ status }: { status: OrderStatus }) {
  if (status === 'Cancelled') {
    return (
      <p className={ui.infoError}>
        <ErrorCircleIcon size={18} />
        This order was cancelled.
      </p>
    );
  }
  const current = STEPS.indexOf(status);
  return (
    <ol className={styles.steps} aria-label="Order progress">
      {STEPS.map((step, i) => {
        const done = i <= current;
        return (
          <li
            key={step}
            className={done ? styles.stepDone : styles.step}
            aria-current={i === current ? 'step' : undefined}
          >
            <span className={styles.stepDot}>{done && <CheckIcon size={14} />}</span>
            <span className={styles.stepName}>{step}</span>
            <span className={styles.stepHint}>{STEP_HINT[step]}</span>
          </li>
        );
      })}
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
  const itemCount = order.lines.reduce((n, l) => n + l.quantity, 0);

  return (
    <div className={styles.wrap}>
      {placed && (
        <div className={ui.infoSuccess} role="status">
          <CheckCircleIcon size={20} />
          <div>
            <strong>Thank you, your order is placed.</strong>
            <br />
            In a real shop a confirmation would go to {order.email}. This is a demo, so
            nothing is sent.
          </div>
        </div>
      )}

      <header className={styles.header}>
        <div>
          <span className={ui.eyebrow}>Order</span>
          <h1 className={styles.orderId}>#{order.id.slice(0, 8).toUpperCase()}</h1>
          <p className={ui.muted}>Placed {formatDate(order.createdAt)}</p>
        </div>
        <StatusPill status={order.status} />
      </header>

      <section className={ui.cardPadded} aria-label="Progress">
        <StatusTracker status={order.status} />
      </section>

      <div className={styles.columns}>
        <section className={ui.cardPadded} aria-labelledby="items-heading">
          <h2 id="items-heading" className={styles.cardHeading}>
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </h2>
          <ul className={styles.lines}>
            {order.lines.map((line) => (
              <li key={line.productId}>
                <Photo src={line.imageUrl} alt="" sizes="72px" className={styles.thumb} />
                <span className={styles.lineText}>
                  <span className={styles.lineTitle}>{line.title}</span>
                  <span className={ui.small}>
                    {line.quantity} × {formatPrice(line.unitPriceCents)}
                  </span>
                </span>
                <span className={styles.lineTotal}>{formatPrice(line.lineTotalCents)}</span>
              </li>
            ))}
          </ul>
          <div className={styles.total}>
            <span>Total</span>
            <span>{formatPrice(order.totalCents)}</span>
          </div>
        </section>

        <aside className={ui.cardPadded} aria-labelledby="ship-heading">
          <h2 id="ship-heading" className={styles.cardHeading}>
            Delivery
          </h2>
          <p className={styles.address}>
            <strong>{order.shippingName}</strong>
            {'\n'}
            {order.shippingAddress}
          </p>
          <p className={ui.small}>{order.email}</p>
          <hr className={ui.divider} />
          <Link href="/" className={`${ui.buttonStandard} ${ui.block}`}>
            Continue shopping
          </Link>
        </aside>
      </div>
    </div>
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
      <Suspense fallback={<div className={styles.skeleton} />}>
        <OrderSummary params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
