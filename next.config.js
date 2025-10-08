/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  images: {
    unoptimized: true, // 이미지 최적화 비활성화
    loader: 'custom',
    loaderFile: './lib/imageLoader.js',
  },
  // 성능 최적화
  swcMinify: true,
  compress: true,
  // Vercel 배포 설정
  output: 'standalone',
  // 정적 파일 서빙을 위한 설정
  trailingSlash: false,
  // assetPrefix 제거 - 캐시 문제 해결
  // assetPrefix: 'https://wolmido.web12.kr',
  // 정적 파일 서빙 활성화
  staticPageGenerationTimeout: 1000,
}

module.exports = nextConfig
