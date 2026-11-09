import type { Metadata } from 'next';
import { CartView } from '@/components/CartView';
import ui from '@/components/ui.module.css';

export const metadata: Metadata = { title: 'Your cart' };

export default function CartPage() {
  return (
    <div className={ui.page}>
      <h1>Your cart</h1>
      <CartView />
    </div>
  );
}
