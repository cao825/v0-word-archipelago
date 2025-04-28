/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['placeholder.com'],
    unoptimized: true,
  },
  // Reduce memory usage during build
  experimental: {
    // Enable optimizations
    optimizeCss: true,
    // Reduce memory usage
    memoryBasedWorkersCount: true,
  },
  // Improve production performance
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  // Optimize output
  output: 'standalone',
};

export default nextConfig;
