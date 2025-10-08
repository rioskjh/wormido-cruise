'use client'

// import Image from 'next/image' // 이미지 최적화 비활성화

interface PageBannerProps {
  title: string
  subtitle?: string
  backgroundImage?: string
}

export default function PageBanner({ 
  title, 
  subtitle, 
  backgroundImage = "/images/visual-banner.png" 
}: PageBannerProps) {
  return (
    <div className="relative w-full h-[300px] overflow-hidden">
      {/* 배경 이미지 */}
      <div className="absolute inset-0">
        <img
          src={backgroundImage}
          alt={title}
          className="w-full h-full object-cover"
        />
        {/* 오버레이 */}
        <div className="absolute inset-0 bg-black bg-opacity-40" />
      </div>
      
      {/* 텍스트 컨텐츠 */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {title}
          </h1>
          {subtitle && (
            <p className="text-lg md:text-xl opacity-90">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
