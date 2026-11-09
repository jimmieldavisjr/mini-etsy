'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './CategoryTabs.module.css';

/** A Fluent-style tab row with a pill indicator under the current page. */
export function CategoryTabs({
  categories,
}: {
  categories: { name: string; slug: string }[];
}) {
  const pathname = usePathname();
  const tabs = [{ name: 'All', href: '/' }].concat(
    categories.map((c) => ({ name: c.name, href: `/c/${c.slug}` })),
  );

  return (
    <nav aria-label="Collections" className={styles.nav}>
      <ul className={styles.list}>
        {tabs.map((tab) => {
          const current = pathname === tab.href;
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                className={styles.tab}
                aria-current={current ? 'page' : undefined}
              >
                {tab.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
