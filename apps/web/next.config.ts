import type { NextConfig } from 'next';

const apiUrl = process.env.API_URL ?? 'http://localhost:4000';

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // Photos come from Unsplash's CDN, which does the resizing.
    loader: 'custom',
    loaderFile: './lib/image-loader.ts',
  },
  // The browser calls /api/*, which Next forwards to the API. The cart cookie
  // then belongs to this site, with no CORS needed.
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${apiUrl}/:path*` }];
  },
};

export default nextConfig;
