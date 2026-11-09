import Link from 'next/link';
import { Suspense } from 'react';
import { AddToCartButton } from '@/components/AddToCartButton';
import { ProductImage } from '@/components/ProductImage';
import ui from '@/components/ui.module.css';
import { api } from '@/lib/api';
import { orNotFound } from '@/lib/or-not-found';
import { formatPrice } from '@/lib/format';
import styles from './product.module.css';

async function ProductDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await orNotFound(api.getProduct(slug));

  return (
    <article className={styles.layout}>
      <ProductImage slug={product.slug} title={product.title} size="large" />
      <div className={styles.info}>
        <nav className={ui.breadcrumb} aria-label="Breadcrumb">
          <Link href="/">Home</Link> /{' '}
          <Link href={`/c/${product.categorySlug}`}>{product.categoryName}</Link>
        </nav>
        <p className={styles.shop}>{product.shopName}</p>
        <h1>{product.title}</h1>
        <p className={styles.price}>{formatPrice(product.priceCents)}</p>
        <p className={styles.stock}>
          {product.stock === 0
            ? 'Sold out'
            : product.stock <= 3
              ? `Only ${product.stock} left`
              : 'In stock'}
        </p>
        <AddToCartButton productId={product.id} stock={product.stock} />
        <h2 className={styles.descHeading}>Description</h2>
        <p className={styles.description}>{product.description}</p>
      </div>
    </article>
  );
}

export default function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <div className={ui.page}>
      <Suspense fallback={<div className={styles.skeleton} />}>
        <ProductDetail params={params} />
      </Suspense>
    </div>
  );
}
