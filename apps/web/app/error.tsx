'use client';

import ui from '@/components/ui.module.css';

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className={ui.page}>
      <h1>Something went wrong</h1>
      <p className={ui.lead}>
        The shop could not load this page. If you are running it locally, check
        that the API is up on the address in API_URL.
      </p>
      <button type="button" className={ui.button} onClick={reset}>
        Try again
      </button>
    </div>
  );
}
