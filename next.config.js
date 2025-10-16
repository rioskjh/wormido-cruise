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
  // standalone 빌드 설정
  output: 'standalone',
  // 정적 파일 서빙을 위한 설정
  trailingSlash: false,
  // assetPrefix 제거 - 캐시 문제 해결
  // assetPrefix: 'https://wolmido.web12.kr',
  // 정적 파일 서빙 활성화
  staticPageGenerationTimeout: 1000,
  // 디자인 폴더 제외
  webpack: (config) => {
    // design-files 폴더의 모든 파일을 제외
    config.module.rules.push({
      test: /\.(tsx?|jsx?)$/,
      include: /design-files/,
      use: 'ignore-loader',
    })
    
    // TypeScript 컴파일러에서 제외
    config.module.rules.push({
      test: /\.(tsx?|jsx?)$/,
      include: /design-files/,
      loader: 'ignore-loader',
    })
    
    return config
  },
}

module.exports = nextConfig
