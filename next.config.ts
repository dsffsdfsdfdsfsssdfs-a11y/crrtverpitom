import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1600, 1920],
    imageSizes: [32, 48, 64, 96, 128, 256, 384],
    qualities: [65, 75],
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'crr-tver.ru', pathname: '/uploads/**' },
      { protocol: 'https', hostname: 'www.crr-tver.ru', pathname: '/uploads/**' }
    ]
  },
  async headers() {
    return [
      {
        source: '/',
        headers: [
          { key: 'Cache-Control', value: 'private, no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0' },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'Expires', value: '0' }
        ]
      }
    ];
  }
};

export default nextConfig;
