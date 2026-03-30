/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
  },
  // Optimizaciones de compilación
  experimental: {
    // Habilitar cache incremental
    optimizePackageImports: ['@mui/material', '@mui/icons-material'],
  },
  //减少重新编译的模块
  swcMinify: true,
  // 更好的 cache
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // 分离编译
  modularizeImports: {
    '@mui/material': {
      transform: '@mui/material/{{member}}',
    },
    '@mui/icons-material': {
      transform: '@mui/icons-material/{{member}}',
    },
  },
};

export default nextConfig;
