import Link from 'next/link';
import { Suspense } from 'react';
import { Photo } from '@/components/Photo';
import { ProductGrid, ProductGridSkeleton } from '@/components/ProductGrid';
import { parseSort, SortTabs } from '@/components/SortTabs';
import ui from '@/components/ui.module.css';
import { api } from '@/lib/api';
import { orNotFound } from '@/lib/or-not-found';
import styles from './category.module.css';

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<{ sort?: string | string[] }>;

async function CategoryContent({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const [{ slug }, { sort: rawSort }] = await Promise.all([params, searchParams]);
  const sort = parseSort(rawSort);
  const [category, products] = await orNotFound(
    Promise.all([
      api.getCategory(slug),
      api.listProducts({ category: slug, sort, limit: 100 }),
    ]),
  );

  return (
    <>
      <header className={styles.banner}>
        <Photo
          src={category.imageUrl}
          alt=""
          sizes="(max-width: 1240px) 100vw, 1192px"
          className={styles.bannerPhoto}
          priority
        />
        <div className={styles.bannerText}>
          <nav className={styles.crumbs} aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <span>Collections</span>
          </nav>
          <h1>{category.name}</h1>
          <p>
            {category.productCount} handmade{' '}
            {category.productCount === 1 ? 'piece' : 'pieces'}
          </p>
        </div>
      </header>

      <div className={styles.toolbar}>
        <p className={ui.small}>
          Showing {products.length} {products.length === 1 ? 'item' : 'items'}
        </p>
        <SortTabs current={sort} basePath={`/c/${slug}`} />
      </div>

      <ProductGrid
        products={products}
        priorityCount={4}
        emptyMessage="No pieces in this collection yet."
      />
    </>
  );
}

export default function CategoryPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  return (
    <div className={ui.page}>
      <Suspense
        fallback={
          <>
            <div className={styles.bannerSkeleton} />
            <ProductGridSkeleton />
          </>
        }
      >
        <CategoryContent params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
