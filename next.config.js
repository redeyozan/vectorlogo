/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['via.placeholder.com', 'xurgzouaxtnptnhwaaax.supabase.co'],
    unoptimized: true,
  },
  // Disable server-side rendering for development to avoid SSR issues
  // This is only for development, in production you would want to enable SSR
  experimental: {
    appDir: false,
  },
};

module.exports = nextConfig;
