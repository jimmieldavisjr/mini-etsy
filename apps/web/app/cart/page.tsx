import type { Metadata } from 'next';
import { CartView } from '@/components/CartView';
import ui from '@/components/ui.module.css';
import styles from './cart.module.css';

export const metadata: Metadata = { title: 'Your cart' };

export default function CartPage() {
  return (
    <div className={ui.page}>
      <header className={styles.header}>
        <span className={ui.eyebrow}>Your selection</span>
        <h1>Shopping cart</h1>
      </header>
      <CartView />
    </div>
  );
}
