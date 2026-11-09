import Link from 'next/link';
import styles from './Logo.module.css';

/**
 * The Mini-Etsy mark: a rounded tile, as Windows 11 app icons are, holding
 * an italic serif "m" with a brass stitch line, the maker's thread.
 */
export function LogoMark({ size = 36, id = 'mark' }: { size?: number; id?: string }) {
  const tile = `${id}-tile`;
  const sheen = `${id}-sheen`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      aria-hidden="true"
      focusable="false"
      className={styles.mark}
    >
      <defs>
        <linearGradient id={tile} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2f5c53" />
          <stop offset="1" stopColor="#173029" />
        </linearGradient>
        <linearGradient id={sheen} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.22" />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="38" height="38" rx="10" fill={`url(#${tile})`} />
      <rect x="1" y="1" width="38" height="38" rx="10" fill={`url(#${sheen})`} />
      <rect
        x="1.5"
        y="1.5"
        width="37"
        height="37"
        rx="9.5"
        fill="none"
        stroke="#d6b77f"
        strokeOpacity="0.55"
      />
      <text
        x="19.5"
        y="27.5"
        textAnchor="middle"
        style={{ fontFamily: 'var(--font-serif)' }}
        fontStyle="italic"
        fontWeight="600"
        fontSize="27"
        fill="#fbf7ee"
      >
        m
      </text>
      <path
        d="M9 31.5c6.5-2.2 15.5-2.2 22 0"
        fill="none"
        stroke="#d6b77f"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeDasharray="2 2.2"
      />
    </svg>
  );
}

export function Logo({ tone = 'dark' }: { tone?: 'dark' | 'light' }) {
  return (
    <Link
      href="/"
      className={`${styles.logo} ${tone === 'light' ? styles.light : ''}`}
      aria-label="Mini-Etsy home"
    >
      <LogoMark id={`logo-${tone}`} />
      <span className={styles.wordmark}>
        <span className={styles.name}>
          <em>Mini</em>
          <span className={styles.dot} aria-hidden="true" />
          Etsy
        </span>
        <span className={styles.tagline}>Handmade atelier</span>
      </span>
    </Link>
  );
}
