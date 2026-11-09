'use client';

/**
 * Global next/image loader (see next.config.ts). Product photos are linked
 * from Unsplash's CDN, which resizes and converts them itself, so the browser
 * asks Unsplash for each srcset width directly.
 */
export default function imageLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  if (src.startsWith('https://images.unsplash.com/')) {
    const params = new URLSearchParams({
      w: String(width),
      q: String(quality ?? 72),
      auto: 'format',
      fit: 'crop',
    });
    return `${src}?${params}`;
  }
  return src;
}
