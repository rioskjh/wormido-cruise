'use client'

import { ReactNode } from 'react'
import UserNavigation from './UserNavigation'
import SubNavigation from './SubNavigation'
import Footer from './Footer'

interface SubPageLayoutProps {
  title: string
  children: ReactNode
  bannerImage?: string
  bannerAlt?: string
}

export default function SubPageLayout({ 
  title, 
  children, 
  bannerImage = '/images/design-assets/aeefcb7185f8ec781f75ece941d96ec57ad9dad5.png',
  bannerAlt = '서브페이지 배너'
}: SubPageLayoutProps) {
  return (
    <div className="bg-white min-h-screen">
      {/* 상단 네비게이션 */}
      <UserNavigation />
      
      {/* 서브 배너 */}
      <div className="relative w-full h-[370px] flex items-center justify-center overflow-hidden rounded-[10px] mx-auto max-w-[1820px]">
        <div className="absolute inset-0">
          <img 
            alt={bannerAlt} 
            className="w-full h-full object-cover rounded-[10px]" 
            src={bannerImage}
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 rounded-[10px]" />
        </div>
        <h1 className="relative z-10 text-white text-[50px] font-bold font-['Pretendard:Bold'] leading-[60px]">
          {title}
        </h1>
      </div>

      {/* 서브 네비게이션 */}
      <SubNavigation />

      {/* 메인 콘텐츠 영역 */}
      <div className="flex flex-col items-center px-4 md:px-0 py-[100px] w-full max-w-[1200px] mx-auto">
        {children}
      </div>
      
      {/* 푸터 */}
      <Footer />
    </div>
  )
}
