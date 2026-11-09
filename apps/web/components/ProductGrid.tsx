import Link from 'next/link';
import type { ProductSummaryDto } from '@mini-etsy/shared';
import { formatPrice } from '@/lib/format';
import { ProductImage } from './ProductImage';
import styles from './ProductGrid.module.css';

export function ProductCard({ product }: { product: ProductSummaryDto }) {
  const soldOut = product.stock === 0;
  return (
    <Link href={`/p/${product.slug}`} className={styles.card}>
      <ProductImage slug={product.slug} title={product.title} />
      <div className={styles.body}>
        <h3 className={styles.title}>{product.title}</h3>
        <p className={styles.shop}>{product.shopName}</p>
        <p className={styles.price}>
          {formatPrice(product.priceCents)}
          {soldOut && <span className={styles.soldOut}>Sold out</span>}
        </p>
      </div>
    </Link>
  );
}

export function ProductGrid({
  products,
  emptyMessage = 'Nothing here yet.',
}: {
  products: ProductSummaryDto[];
  emptyMessage?: string;
}) {
  if (products.length === 0) {
    return <p className={styles.empty}>{emptyMessage}</p>;
  }
  return (
    <ul className={styles.grid}>
      {products.map((product) => (
        <li key={product.id}>
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <ul className={styles.grid} aria-busy="true" aria-label="Loading products">
      {Array.from({ length: count }, (_, i) => (
        <li key={i} className={styles.skeleton} />
      ))}
    </ul>
  );
}
