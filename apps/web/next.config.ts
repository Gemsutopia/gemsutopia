import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  // Transpile workspace packages
  transpilePackages: [
    '@gemsutopia/database',
    '@gemsutopia/cache',
    '@gemsutopia/realtime',
    '@gemsutopia/email',
    '@gemsutopia/auth',
    '@gemsutopia/storage',
    '@gemsutopia/ui',
    '@gemsutopia/utils',
  ],
  poweredByHeader: false,
  experimental: {
    largePageDataBytes: 128 * 1024, // 128kb
    optimizePackageImports: [
      '@tabler/icons-react',
      'lucide-react',
      '@fortawesome/free-solid-svg-icons',
      '@fortawesome/free-brands-svg-icons',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-tabs',
      '@radix-ui/react-tooltip',
      '@radix-ui/react-accordion',
      'sonner',
    ],
  },
  // Configure API routes
  async rewrites() {
    return [];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'odqcbgwakcysfluoinmn.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
        port: '',
        pathname: '/**',
      },
    ],
    // Limit image sizes to reduce optimization transformations
    deviceSizes: [640, 1080, 1920],
    imageSizes: [16, 32, 48, 64, 128, 256],
    minimumCacheTTL: 2678400, // 31 days - keep optimized images cached as long as possible
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value:
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.hcaptcha.com https://hcaptcha.com https://js.stripe.com https://www.googletagmanager.com https://www.paypal.com https://*.paypal.com 'wasm-unsafe-eval'; frame-src https://hcaptcha.com https://newassets.hcaptcha.com https://js.stripe.com https://hooks.stripe.com https://www.paypal.com https://*.paypal.com; style-src 'self' 'unsafe-inline' https://hcaptcha.com https://newassets.hcaptcha.com; connect-src 'self' http://localhost:3001 https://hcaptcha.com https://api.hcaptcha.com https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://www.google-analytics.com https://www.paypal.com https://*.paypal.com https://api.sandbox.paypal.com https://api.emailjs.com https://api.devnet.solana.com https://devnet.helius-rpc.com https://rpc.sepolia.org https://sepolia.etherscan.io https://api.coingecko.com https://api.frankfurter.app https://app.quickdash.net;",
          },
        ],
      },
      // Aggressive caching for optimized images
      {
        source: '/_next/image',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=2678400, s-maxage=2678400, stale-while-revalidate=86400' },
        ],
      },
      // Cache static assets for 1 year
      {
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
};

export default nextConfig;
