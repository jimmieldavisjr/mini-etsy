import type { Metadata } from 'next';
import { CheckoutPanel } from '@/components/CheckoutPanel';
import ui from '@/components/ui.module.css';
import styles from '../cart/cart.module.css';

export const metadata: Metadata = { title: 'Checkout' };

export default function CheckoutPage() {
  return (
    <div className={ui.page}>
      <header className={styles.header}>
        <span className={ui.eyebrow}>Almost there</span>
        <h1>Checkout</h1>
      </header>
      <CheckoutPanel />
    </div>
  );
}
