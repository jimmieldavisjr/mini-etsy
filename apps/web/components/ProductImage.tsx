import styles from './ProductImage.module.css';

/** Picks a stable hue from the slug, so each product keeps its own color. */
function hueFor(slug: string): number {
  let hash = 0;
  for (const char of slug) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return hash % 360;
}

function initials(title: string): string {
  return title
    .split(/\s+/)
    .filter((word) => /^[A-Za-z]/.test(word))
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('');
}

/**
 * A placeholder in place of a photo. Image upload is out of scope for v1.
 */
export function ProductImage({
  slug,
  title,
  size = 'card',
}: {
  slug: string;
  title: string;
  size?: 'card' | 'large' | 'thumb';
}) {
  const hue = hueFor(slug);
  return (
    <div
      className={`${styles.image} ${styles[size]}`}
      style={{
        background: `linear-gradient(135deg, hsl(${hue} 55% 82%), hsl(${(hue + 40) % 360} 50% 68%))`,
        color: `hsl(${hue} 45% 28%)`,
      }}
      role="img"
      aria-label={title}
    >
      <span aria-hidden="true">{initials(title)}</span>
    </div>
  );
}
