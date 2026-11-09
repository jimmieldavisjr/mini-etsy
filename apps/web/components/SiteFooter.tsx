import Link from 'next/link';
import { Logo } from './Logo';
import ui from './ui.module.css';
import styles from './SiteFooter.module.css';

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={`${ui.container} ${styles.grid}`}>
        <div className={styles.brand}>
          <Logo tone="light" />
          <p className={styles.blurb}>
            A small storefront for things made slowly and by hand. Every shop
            here is invented for this demo.
          </p>
        </div>
        <nav aria-label="Shop" className={styles.column}>
          <h2 className={styles.heading}>Shop</h2>
          <Link href="/#new">New arrivals</Link>
          <Link href="/#collections">Collections</Link>
          <Link href="/search">Search</Link>
          <Link href="/cart">Your cart</Link>
        </nav>
        <div className={styles.column}>
          <h2 className={styles.heading}>About this demo</h2>
          <p>No payment is taken and nothing ships.</p>
          <p>
            Photography from{' '}
            <a href="https://unsplash.com" rel="noreferrer" target="_blank">
              Unsplash
            </a>
            .
          </p>
        </div>
      </div>
      <div className={`${ui.container} ${styles.base}`}>
        <span>© 2026 Mini-Etsy. Released under the MIT License.</span>
        <span>Made by hand, in TypeScript.</span>
      </div>
    </footer>
  );
}
