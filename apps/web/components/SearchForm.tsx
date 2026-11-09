import { SearchIcon } from './icons';
import styles from './SearchForm.module.css';

/** A plain GET form, so search works before any JavaScript loads. */
export function SearchForm() {
  return (
    <form action="/search" method="get" role="search" className={styles.form}>
      <label htmlFor="site-search" className="visually-hidden">
        Search the shop
      </label>
      <input
        id="site-search"
        name="q"
        type="search"
        placeholder="Search rings, mugs, prints…"
        maxLength={100}
        className={styles.input}
      />
      <button type="submit" className={styles.button} aria-label="Search">
        <SearchIcon size={18} />
      </button>
    </form>
  );
}
