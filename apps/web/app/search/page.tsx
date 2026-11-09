import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { SearchIcon } from '@/components/icons';
import { ProductGrid, ProductGridSkeleton } from '@/components/ProductGrid';
import { parseSort, SortTabs } from '@/components/SortTabs';
import ui from '@/components/ui.module.css';
import { api } from '@/lib/api';
import styles from './search.module.css';

export const metadata: Metadata = { title: 'Search' };

type SearchParams = Promise<{ q?: string | string[]; sort?: string | string[] }>;

async function SearchResults({ searchParams }: { searchParams: SearchParams }) {
  const { q, sort: rawSort } = await searchParams;
  const query = (Array.isArray(q) ? q[0] : q)?.trim().slice(0, 100) ?? '';
  const sort = parseSort(rawSort);
  const products = await api.listProducts({ q: query || undefined, sort, limit: 100 });

  return (
    <>
      <header className={styles.header}>
        <span className={ui.eyebrow}>{query ? 'Search results' : 'The whole shop'}</span>
        <h1>{query ? <>&ldquo;{query}&rdquo;</> : 'Everything handmade'}</h1>
        <form action="/search" method="get" role="search" className={styles.searchBox}>
          <SearchIcon size={18} />
          <label htmlFor="page-search" className="visually-hidden">
            Search the shop
          </label>
          <input
            id="page-search"
            name="q"
            type="search"
            defaultValue={query}
            placeholder="Try “linen”, “silver” or “print”"
            maxLength={100}
            className={styles.searchInput}
          />
          <button type="submit" className={ui.buttonAccent}>
            Search
          </button>
        </form>
      </header>

      <div className={styles.toolbar}>
        <p className={ui.small}>
          {products.length} {products.length === 1 ? 'item' : 'items'}
        </p>
        <SortTabs current={sort} basePath="/search" extraParams={query ? { q: query } : {}} />
      </div>

      {products.length === 0 ? (
        <div className={`${ui.cardPadded} ${styles.empty}`}>
          <h2>Nothing matches that yet</h2>
          <p className={ui.muted}>Try a shorter word, or browse a collection instead.</p>
          <Link href="/#collections" className={ui.buttonStandard}>
            Browse collections
          </Link>
        </div>
      ) : (
        <ProductGrid products={products} priorityCount={4} />
      )}
    </>
  );
}

export default function SearchPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <div className={ui.page}>
      <Suspense fallback={<ProductGridSkeleton />}>
        <SearchResults searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
