'use client'

import { useState, useEffect } from 'react'
import { useParams, usePathname } from 'next/navigation'
import UserNavigation from '@/components/UserNavigation'
import SubNavigation from '@/components/SubNavigation'
import Footer from '@/components/Footer'
import './content-styles.css'

interface Content {
  id: number
  title: string
  content: string
  slug: string
  createdAt: string
  updatedAt: string
}

export default function ContentPage() {
  const params = useParams()
  const pathname = usePathname()
  const slug = params.slug as string
  
  const [content, setContent] = useState<Content | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [mainMenuTitle, setMainMenuTitle] = useState('컨텐츠')

  // 1차 메뉴명 가져오기
  useEffect(() => {
    const fetchMainMenuTitle = async () => {
      try {
        const response = await fetch('/api/navigations')
        const data = await response.json()
        
        if (data.ok && data.data) {
          // 현재 경로와 매칭되는 1차 메뉴 찾기
          for (const nav of data.data) {
            if (nav.children && nav.children.length > 0) {
              for (const child of nav.children) {
                if (child.url && pathname.startsWith(child.url)) {
                  setMainMenuTitle(nav.title)
                  return
                }
              }
            }
          }
        }
      } catch (error) {
        console.error('네비게이션 정보 조회 오류:', error)
      }
    }

    fetchMainMenuTitle()
  }, [pathname])

  useEffect(() => {
    if (slug) {
      fetchContent()
    }
  }, [slug])

  const fetchContent = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/contents/${slug}`)
      const data = await response.json()
      
      if (data.ok) {
        setContent(data.data.content)
      } else {
        setError(data.error || '컨텐츠를 찾을 수 없습니다.')
      }
    } catch (error) {
      console.error('컨텐츠 조회 오류:', error)
      setError('컨텐츠를 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <UserNavigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">컨텐츠를 불러오는 중...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !content) {
    return (
      <div className="min-h-screen bg-white">
        <UserNavigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {error || '컨텐츠를 찾을 수 없습니다'}
            </h1>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <UserNavigation />
      
      {/* 비주얼 섹션 */}
      <div className="relative w-full h-[370px] flex items-center justify-center overflow-hidden rounded-[10px] mx-auto max-w-[1820px]">
        <div className="absolute inset-0">
          <img 
            alt="컨텐츠 배너" 
            className="w-full h-full object-cover rounded-[10px]" 
            src="/images/design-assets/aeefcb7185f8ec781f75ece941d96ec57ad9dad5.png" 
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 rounded-[10px]" />
        </div>
        <h1 className="relative z-10 text-white text-[50px] font-bold font-['Pretendard:Bold'] leading-[60px]">
          {mainMenuTitle}
        </h1>
      </div>
      
      {/* 서브 네비게이션 */}
      <SubNavigation />
      
      <div className="py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">{content.title}</h1>
            <div className="prose max-w-none">
              <div 
                className="content-styles"
                dangerouslySetInnerHTML={{ __html: content.content }}
              />
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}
