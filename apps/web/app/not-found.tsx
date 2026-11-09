import Link from 'next/link';
import { SearchIcon } from '@/components/icons';
import ui from '@/components/ui.module.css';
import styles from './status-page.module.css';

export default function NotFound() {
  return (
    <div className={ui.page}>
      <div className={`${ui.cardPadded} ${styles.card}`}>
        <span className={styles.icon}>
          <SearchIcon size={28} />
        </span>
        <span className={ui.eyebrow}>404</span>
        <h1>We couldn&apos;t find that</h1>
        <p className={ui.muted}>It may have sold out, moved, or never existed.</p>
        <div className={styles.actions}>
          <Link href="/" className={`${ui.buttonAccent} ${ui.large}`}>
            Back to the shop
          </Link>
          <Link href="/search" className={`${ui.buttonStandard} ${ui.large}`}>
            Search
          </Link>
        </div>
      </div>
    </div>
  );
}
