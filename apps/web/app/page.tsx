import Link from 'next/link';
import { Suspense } from 'react';
import { ProductGrid, ProductGridSkeleton } from '@/components/ProductGrid';
import ui from '@/components/ui.module.css';
import { api } from '@/lib/api';
import styles from './home.module.css';

async function CategoryTiles() {
  const categories = await api.listCategories();
  return (
    <ul className={styles.tiles}>
      {categories.map((category) => (
        <li key={category.id}>
          <Link href={`/c/${category.slug}`} className={styles.tile}>
            <span className={styles.tileName}>{category.name}</span>
            <span className={styles.tileCount}>
              {category.productCount} items
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

async function NewestProducts() {
  const products = await api.listProducts({ sort: 'new', limit: 8 });
  return <ProductGrid products={products} />;
}

export default function HomePage() {
  return (
    <div className={ui.page}>
      <section className={styles.hero}>
        <h1>Find things you&apos;ll love, made by hand.</h1>
        <p className={ui.lead}>
          Small batches from independent makers: jewelry, home goods, prints,
          clothing and paper.
        </p>
      </section>

      <section aria-labelledby="categories-heading">
        <h2 id="categories-heading" className="visually-hidden">
          Shop by category
        </h2>
        <Suspense fallback={<div className={styles.tilesSkeleton} />}>
          <CategoryTiles />
        </Suspense>
      </section>

      <section className={ui.section} aria-labelledby="new-heading">
        <div className={ui.sectionHeader}>
          <h2 id="new-heading">Fresh from the workshop</h2>
        </div>
        <Suspense fallback={<ProductGridSkeleton />}>
          <NewestProducts />
        </Suspense>
      </section>
    </div>
  );
}
