'use client';

import { ErrorCircleIcon } from '@/components/icons';
import ui from '@/components/ui.module.css';
import styles from './status-page.module.css';

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className={ui.page}>
      <div className={`${ui.cardPadded} ${styles.card}`}>
        <span className={`${styles.icon} ${styles.iconError}`}>
          <ErrorCircleIcon size={28} />
        </span>
        <h1>Something went wrong</h1>
        <p className={ui.muted}>
          The shop could not load this page. If you are running it locally,
          check that the API is up on the address in API_URL.
        </p>
        <div className={styles.actions}>
          <button type="button" className={`${ui.buttonAccent} ${ui.large}`} onClick={reset}>
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}
