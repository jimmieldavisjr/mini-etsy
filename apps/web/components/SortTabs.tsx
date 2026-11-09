import Link from 'next/link';
import type { ProductSort } from '@mini-etsy/shared';
import styles from './SortTabs.module.css';

const OPTIONS: { value: ProductSort; label: string }[] = [
  { value: 'new', label: 'Newest' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
];

export function parseSort(value: string | string[] | undefined): ProductSort {
  const v = Array.isArray(value) ? value[0] : value;
  return OPTIONS.some((o) => o.value === v) ? (v as ProductSort) : 'new';
}

/** Fluent SelectorBar: a segmented row of links that set ?sort=. */
export function SortTabs({
  current,
  basePath,
  extraParams = {},
}: {
  current: ProductSort;
  basePath: string;
  extraParams?: Record<string, string>;
}) {
  return (
    <nav aria-label="Sort products" className={styles.bar}>
      {OPTIONS.map((option) => {
        const params = new URLSearchParams(extraParams);
        if (option.value !== 'new') params.set('sort', option.value);
        const qs = params.toString();
        return (
          <Link
            key={option.value}
            href={qs ? `${basePath}?${qs}` : basePath}
            className={styles.option}
            aria-current={option.value === current ? 'true' : undefined}
            scroll={false}
          >
            {option.label}
          </Link>
        );
      })}
    </nav>
  );
}
