import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ProductGrid, ProductGridSkeleton } from '@/components/ProductGrid';
import ui from '@/components/ui.module.css';
import { api } from '@/lib/api';

export const metadata: Metadata = { title: 'Search' };

type SearchParams = Promise<{ q?: string | string[] }>;

async function SearchResults({ searchParams }: { searchParams: SearchParams }) {
  const { q } = await searchParams;
  const query = (Array.isArray(q) ? q[0] : q)?.trim().slice(0, 100) ?? '';

  if (!query) {
    return (
      <>
        <h1>Search</h1>
        <p className={ui.lead}>Type something in the search box to find items.</p>
      </>
    );
  }

  const products = await api.listProducts({ q: query, limit: 100 });
  return (
    <>
      <h1>Results for &ldquo;{query}&rdquo;</h1>
      <p className={ui.lead}>
        {products.length} {products.length === 1 ? 'item' : 'items'} found
      </p>
      <ProductGrid
        products={products}
        emptyMessage="No items match that search. Try a shorter word."
      />
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
