import type { Metadata } from 'next';
import { CheckoutPanel } from '@/components/CheckoutPanel';
import ui from '@/components/ui.module.css';

export const metadata: Metadata = { title: 'Checkout' };

export default function CheckoutPage() {
  return (
    <div className={ui.page}>
      <h1>Checkout</h1>
      <CheckoutPanel />
    </div>
  );
}
