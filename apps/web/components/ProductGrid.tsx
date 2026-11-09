import Link from 'next/link';
import type { ProductSummaryDto } from '@mini-etsy/shared';
import { formatPrice } from '@/lib/format';
import { Photo } from './Photo';
import styles from './ProductGrid.module.css';

const CARD_SIZES = '(max-width: 640px) 50vw, (max-width: 1100px) 33vw, 290px';

export function ProductCard({
  product,
  priority = false,
}: {
  product: ProductSummaryDto;
  priority?: boolean;
}) {
  const soldOut = product.stock === 0;
  const low = !soldOut && product.stock <= 3;
  return (
    <Link href={`/p/${product.slug}`} className={styles.card}>
      <Photo
        src={product.imageUrl}
        alt={product.title}
        sizes={CARD_SIZES}
        className={`${styles.photo} ${soldOut ? styles.soldOutPhoto : ''}`}
        priority={priority}
        zoomOnHover
      />
      {soldOut && <span className={styles.badge}>Sold out</span>}
      {low && <span className={`${styles.badge} ${styles.badgeLow}`}>Only {product.stock} left</span>}
      <div className={styles.body}>
        <p className={styles.shop}>{product.shopName}</p>
        <h3 className={styles.title}>{product.title}</h3>
        <p className={styles.price}>{formatPrice(product.priceCents)}</p>
      </div>
    </Link>
  );
}

export function ProductGrid({
  products,
  emptyMessage = 'Nothing here yet.',
  priorityCount = 0,
}: {
  products: ProductSummaryDto[];
  emptyMessage?: string;
  /** How many leading cards load eagerly (those above the fold). */
  priorityCount?: number;
}) {
  if (products.length === 0) {
    return <p className={styles.empty}>{emptyMessage}</p>;
  }
  return (
    <ul className={styles.grid}>
      {products.map((product, i) => (
        <li key={product.id}>
          <ProductCard product={product} priority={i < priorityCount} />
        </li>
      ))}
    </ul>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <ul className={styles.grid} aria-busy="true" aria-label="Loading products">
      {Array.from({ length: count }, (_, i) => (
        <li key={i}>
          <div className={styles.skeletonPhoto} />
          <div className={styles.skeletonLine} />
          <div className={styles.skeletonLineShort} />
        </li>
      ))}
    </ul>
  );
}
