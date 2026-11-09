import styles from './SearchForm.module.css';

/** A plain GET form, so search works before any JavaScript loads. */
export function SearchForm({ defaultValue = '' }: { defaultValue?: string }) {
  return (
    <form action="/search" method="get" role="search" className={styles.form}>
      <label htmlFor="site-search" className="visually-hidden">
        Search for anything
      </label>
      <input
        id="site-search"
        name="q"
        type="search"
        placeholder="Search for anything"
        defaultValue={defaultValue}
        maxLength={100}
        className={styles.input}
      />
      <button type="submit" className={styles.button} aria-label="Search">
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="m20 20-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
    </form>
  );
}
