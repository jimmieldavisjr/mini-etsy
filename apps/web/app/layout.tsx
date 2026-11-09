import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import { Suspense } from 'react';
import { CartLink } from '@/components/CartLink';
import { CategoryNav } from '@/components/CategoryNav';
import { Logo } from '@/components/Logo';
import { SearchForm } from '@/components/SearchForm';
import { SiteFooter } from '@/components/SiteFooter';
import ui from '@/components/ui.module.css';
import styles from './layout.module.css';
import './globals.css';

// Serif for the brand, headings and prices.
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
});

// Fallback for Segoe UI Variable on systems that do not have it.
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: { default: 'Mini-Etsy · Handmade atelier', template: '%s · Mini-Etsy' },
  description: 'Small-batch, handmade goods from independent (and made-up) makers.',
};

export const viewport: Viewport = {
  themeColor: '#f4f1ec',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable}`}>
      <body>
        <a href="#main" className={styles.skipLink}>
          Skip to content
        </a>
        <div className={styles.announcement}>
          A demo storefront: made-up makers, real photography from Unsplash.
        </div>
        <header className={styles.header}>
          <div className={`${ui.container} ${styles.headerTop}`}>
            <Logo />
            <SearchForm />
            <CartLink />
          </div>
          <div className={ui.container}>
            <Suspense fallback={<div className={styles.navPlaceholder} />}>
              <CategoryNav />
            </Suspense>
          </div>
        </header>
        <main id="main" className={ui.container}>
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
