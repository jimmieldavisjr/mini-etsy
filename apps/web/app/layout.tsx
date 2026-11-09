import type { Metadata } from 'next';
import Link from 'next/link';
import { CartLink } from '@/components/CartLink';
import { SearchForm } from '@/components/SearchForm';
import ui from '@/components/ui.module.css';
import styles from './layout.module.css';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'Mini-Etsy', template: '%s · Mini-Etsy' },
  description: 'Handmade goods from small, independent (and made-up) shops.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className={styles.header}>
          <div className={`${ui.container} ${styles.headerInner}`}>
            <Link href="/" className={styles.logo}>
              mini<span>etsy</span>
            </Link>
            <SearchForm />
            <CartLink />
          </div>
        </header>
        <main className={ui.container}>{children}</main>
        <footer className={styles.footer}>
          <div className={ui.container}>
            Mini-Etsy is a demo store. Shops and products are made up, and
            no payment is taken.
          </div>
        </footer>
      </body>
    </html>
  );
}
