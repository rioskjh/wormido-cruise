/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  images: {
    domains: ['localhost'],
  },
  // 성능 최적화
  swcMinify: true,
  compress: true,
  // Vercel 배포 설정
  output: 'standalone',
}

module.exports = nextConfig
