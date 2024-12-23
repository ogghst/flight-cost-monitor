/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ['@fcm/shared-webui'],
    env: {
        NEXT_PUBLIC_AZURE_CLIENT_ID: process.env.NEXT_PUBLIC_AZURE_CLIENT_ID,
        NEXT_PUBLIC_AZURE_TENANT_ID: process.env.NEXT_PUBLIC_AZURE_TENANT_ID,
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
        NEXT_PUBLIC_API_SCOPE: process.env.NEXT_PUBLIC_API_SCOPE,
    },
    productionBrowserSourceMaps: true,
    webpack: (config, { isServer }) => {
        // Enable source maps in production
        config.devtool = isServer ? 'source-map' : 'source-map'
        return config
    },
}

export default nextConfig
