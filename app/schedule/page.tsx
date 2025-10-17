'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import UserNavigation from '@/components/UserNavigation'
import SubNavigation from '@/components/SubNavigation'
import Footer from '@/components/Footer'

interface NavigationItem {
  id: number
  title: string
  url: string | null
  type: 'CUSTOM' | 'PRODUCTS' | 'BOARD' | 'CONTENT' | 'EXTERNAL' | 'SCHEDULE'
  targetId: number | null
  parentId: number | null
  sortOrder: number
  isActive: boolean
  isNewWindow: boolean
  children: NavigationItem[]
}

export default function SchedulePage() {
  const pathname = usePathname()
  const [mainMenuTitle, setMainMenuTitle] = useState('일정관리')

  useEffect(() => {
    const fetchMainMenuTitle = async () => {
      try {
        const response = await fetch('/api/navigations')
        const data = await response.json()
        
        if (data.ok && data.data) {
          for (const nav of data.data) {
            if (nav.children && nav.children.length > 0) {
              for (const child of nav.children) {
                if (child.url && pathname.startsWith(child.url)) {
                  setMainMenuTitle(nav.title)
                  return
                }
              }
            }
            // 직접 일정관리 메뉴인 경우
            if (nav.url === '/schedule' && nav.type === 'SCHEDULE') {
              setMainMenuTitle(nav.title)
              return
            }
          }
        }
      } catch (error) {
        console.error('네비게이션 정보 조회 오류:', error)
      }
    }
    fetchMainMenuTitle()
  }, [pathname])

  return (
    <div className="min-h-screen bg-white">
      <UserNavigation />
      
      {/* 비주얼 섹션 */}
      <div className="relative w-full h-[370px] flex items-center justify-center overflow-hidden rounded-[10px] mx-auto max-w-[1820px]">
        <div className="absolute inset-0">
          <img 
            alt="일정관리 배너" 
            className="w-full h-full object-cover rounded-[10px]" 
            src="/images/design-assets/aeefcb7185f8ec781f75ece941d96ec57ad9dad5.png" 
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 rounded-[10px]" />
        </div>
        <h1 className="relative z-10 text-white text-[50px] font-bold font-['Pretendard:Bold'] leading-[60px]">
          {mainMenuTitle}
        </h1>
      </div>
      
      <SubNavigation />
      
      {/* 일정관리 컨텐츠 영역 */}
      <div className="py-8">
        <div className="container mx-auto px-4" style={{ maxWidth: '1200px' }}>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">일정관리</h2>
            
            {/* 임시 컨텐츠 - 추후 데이터 연동 예정 */}
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">크루즈 일정</h3>
                <p className="text-gray-600">크루즈 운항 일정 정보가 표시됩니다.</p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">특별 이벤트</h3>
                <p className="text-gray-600">특별 이벤트 일정 정보가 표시됩니다.</p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">운항 안내</h3>
                <p className="text-gray-600">운항 관련 안내 정보가 표시됩니다.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}
