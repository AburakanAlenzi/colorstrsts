/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
    unoptimized: true,
  },
  // Note: redirects, rewrites, and headers don't work with static export
  // These are commented out for static deployment
  // async redirects() {
  //   return [
  //     {
  //       source: '/',
  //       destination: '/ar',
  //       permanent: false,
  //     },
  //   ];
  // },
  // async rewrites() {
  //   return [
  //     {
  //       source: '/admin',
  //       destination: '/ar/admin',
  //     },
  //     {
  //       source: '/en/admin',
  //       destination: '/en/admin',
  //     },
  //   ];
  // },
  // Enable static exports for deployment
  output: 'export',
  trailingSlash: true,
  distDir: 'out',

  // إعدادات خاصة بـ Capacitor
  assetPrefix: '',
  basePath: '',

  // تعطيل ESLint مؤقتاً للبناء
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Optimization for static export
  // experimental: {
  //   esmExternals: false
  // },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };

    // Ensure proper path resolution for Netlify
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, 'src'),
    };

    return config;
  },
  
  // Security headers (disabled for static export)
  // async headers() {
  //   return [
  //     {
  //       source: '/(.*)',
  //       headers: [
  //         {
  //           key: 'X-Frame-Options',
  //           value: 'SAMEORIGIN',
  //         },
  //         {
  //           key: 'X-Content-Type-Options',
  //           value: 'nosniff',
  //         },
  //         {
  //           key: 'X-XSS-Protection',
  //           value: '1; mode=block',
  //         },
  //         {
  //           key: 'Referrer-Policy',
  //           value: 'strict-origin-when-cross-origin',
  //         },
  //         {
  //           key: 'Content-Security-Policy',
  //           value: "default-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.supabase.co https://fonts.googleapis.com https://fonts.gstatic.com https://cdnjs.cloudflare.com; img-src 'self' data: https: blob:; font-src 'self' https://fonts.gstatic.com data:;",
  //         },
  //       ],
  //     },
  //   ];
  // },
};

module.exports = nextConfig;
