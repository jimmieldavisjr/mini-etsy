import { api } from '@/lib/api';
import { CategoryTabs } from './CategoryTabs';

/** Loads the categories for the header's tab row. */
export async function CategoryNav() {
  const categories = await api.listCategories().catch(() => []);
  return (
    <CategoryTabs
      categories={categories.map(({ name, slug }) => ({ name, slug }))}
    />
  );
}
