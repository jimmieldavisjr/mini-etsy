import Image from 'next/image';
import { ImageIcon } from './icons';
import styles from './Photo.module.css';

/**
 * A product or editorial photo that fills its frame. The frame's shape comes
 * from the className (aspect ratio, radius). Without a URL it shows a quiet
 * placeholder instead of a broken image.
 */
export function Photo({
  src,
  alt,
  sizes,
  className = '',
  priority = false,
  zoomOnHover = false,
}: {
  src: string | null;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
  zoomOnHover?: boolean;
}) {
  return (
    <div className={`${styles.frame} ${zoomOnHover ? styles.zoom : ''} ${className}`}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className={styles.image}
        />
      ) : (
        <div className={styles.placeholder} role="img" aria-label={alt}>
          <ImageIcon size={28} />
        </div>
      )}
    </div>
  );
}
