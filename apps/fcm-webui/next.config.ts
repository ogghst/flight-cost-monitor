import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Enable source maps in production for better debugging
  //productionBrowserSourceMaps: true,

  // Configure module resolution and transpilation
  //transpilePackages: ['@fcm/shared', '@fcm/shared-webui', '@fcm/storage'],

  webpack: (config, options) => {
    /*
    config.resolve.extensions = [
      '.tsx',
      '.ts',
      '.js',
      '.jsx',
      ...config.resolve.extensions,
    ]

    config.devtool = isServer ? false : 'source-map'

    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        global: false,
      }
    }
      */
    return config
  },

  // Enable experimental features
  experimental: {
    // Enable serverActions if needed
    // Enable TypeScript Module Resolution if needed
    //typedRoutes: true,
  },

  // Environment variables that should be available in the browser
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  },

  // Headers for security and optimization
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}

export default nextConfig
