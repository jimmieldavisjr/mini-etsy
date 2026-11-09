import Link from 'next/link';
import { Suspense } from 'react';
import { ProductGrid, ProductGridSkeleton } from '@/components/ProductGrid';
import ui from '@/components/ui.module.css';
import { api } from '@/lib/api';
import { orNotFound } from '@/lib/or-not-found';

async function CategoryProducts({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [category, products] = await orNotFound(
    Promise.all([
      api.getCategory(slug),
      api.listProducts({ category: slug, sort: 'new', limit: 100 }),
    ]),
  );
  return (
    <>
      <nav className={ui.breadcrumb} aria-label="Breadcrumb">
        <Link href="/">Home</Link> / {category.name}
      </nav>
      <h1>{category.name}</h1>
      <p className={ui.lead}>
        {category.productCount} handmade{' '}
        {category.productCount === 1 ? 'item' : 'items'}
      </p>
      <ProductGrid products={products} emptyMessage="No items in this category yet." />
    </>
  );
}

export default function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <div className={ui.page}>
      <Suspense fallback={<ProductGridSkeleton />}>
        <CategoryProducts params={params} />
      </Suspense>
    </div>
  );
}
