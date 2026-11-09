import Link from 'next/link';
import { Suspense } from 'react';
import type { ProductDetailDto } from '@mini-etsy/shared';
import { AddToCartButton } from '@/components/AddToCartButton';
import { GiftIcon, HandIcon, LeafIcon } from '@/components/icons';
import { Photo } from '@/components/Photo';
import { ProductGrid } from '@/components/ProductGrid';
import ui from '@/components/ui.module.css';
import { api } from '@/lib/api';
import { formatPrice } from '@/lib/format';
import { orNotFound } from '@/lib/or-not-found';
import styles from './product.module.css';

function StockPill({ stock }: { stock: number }) {
  if (stock === 0) return <span className={ui.pillNeutral}>Sold out</span>;
  if (stock <= 3) return <span className={ui.pillCaution}>Only {stock} left</span>;
  return <span className={ui.pillSuccess}>In stock</span>;
}

async function MoreFromCollection({ product }: { product: ProductDetailDto }) {
  const all = await api.listProducts({ category: product.categorySlug, limit: 6 });
  const others = all.filter((p) => p.id !== product.id).slice(0, 4);
  if (others.length === 0) return null;
  return (
    <section className={ui.section} aria-labelledby="more-heading">
      <div className={ui.sectionHeader}>
        <div>
          <span className={ui.eyebrow}>You may also like</span>
          <h2 id="more-heading">More from {product.categoryName}</h2>
        </div>
        <Link href={`/c/${product.categorySlug}`} className={ui.textLink}>
          View the collection
        </Link>
      </div>
      <ProductGrid products={others} />
    </section>
  );
}

async function ProductDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await orNotFound(api.getProduct(slug));

  return (
    <>
      <nav className={ui.breadcrumb} aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span aria-hidden="true">/</span>
        <Link href={`/c/${product.categorySlug}`}>{product.categoryName}</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{product.title}</span>
      </nav>

      <article className={styles.layout}>
        <figure className={styles.gallery}>
          <Photo
            src={product.imageUrl}
            alt={product.title}
            sizes="(max-width: 900px) 100vw, 640px"
            className={styles.photo}
            priority
          />
          {product.imageSourceUrl && (
            <figcaption className={ui.small}>
              Photo via{' '}
              <a href={product.imageSourceUrl} target="_blank" rel="noreferrer">
                Unsplash
              </a>
            </figcaption>
          )}
        </figure>

        <div className={styles.panel}>
          <span className={ui.eyebrow}>{product.shopName}</span>
          <h1 className={styles.title}>{product.title}</h1>
          <div className={styles.priceRow}>
            <p className={styles.price}>{formatPrice(product.priceCents)}</p>
            <StockPill stock={product.stock} />
          </div>

          <AddToCartButton productId={product.id} stock={product.stock} />

          <ul className={styles.features}>
            <li>
              <HandIcon size={20} />
              <span>
                Handmade by <strong>{product.shopName}</strong>
              </span>
            </li>
            <li>
              <LeafIcon size={20} />
              <span>Made in a small batch, so stock is limited</span>
            </li>
            <li>
              <GiftIcon size={20} />
              <span>Wrapped in recycled paper, ready to give</span>
            </li>
          </ul>

          <hr className={ui.divider} />

          <h2 className={styles.descHeading}>About this piece</h2>
          <p className={styles.description}>{product.description}</p>
        </div>
      </article>

      <Suspense fallback={null}>
        <MoreFromCollection product={product} />
      </Suspense>
    </>
  );
}

export default function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <div className={ui.page}>
      <Suspense
        fallback={
          <div className={styles.layout}>
            <div className={styles.skeletonPhoto} />
            <div className={styles.skeletonPanel} />
          </div>
        }
      >
        <ProductDetail params={params} />
      </Suspense>
    </div>
  );
}
