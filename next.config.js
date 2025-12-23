/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // Production optimizations
  compress: true,
  poweredByHeader: false,

  // Standalone output for better deployment
  output: 'standalone',
}

module.exports = nextConfig
