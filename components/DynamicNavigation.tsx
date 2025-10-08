'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavigationItem {
  id: number
  title: string
  url: string | null
  type: 'CUSTOM' | 'PRODUCTS' | 'BOARD' | 'CONTENT' | 'EXTERNAL'
  targetId: number | null
  parentId: number | null
  sortOrder: number
  isActive: boolean
  isNewWindow: boolean
  children: NavigationItem[]
}

interface Category {
  id: number
  name: string
  sortOrder: number
}

interface DynamicNavigationProps {
  className?: string
  onItemClick?: () => void
}

export default function DynamicNavigation({ className = '', onItemClick }: DynamicNavigationProps) {
  const [navigations, setNavigations] = useState<NavigationItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [activeMenu, setActiveMenu] = useState<number | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    fetchNavigations()
    fetchCategories()
  }, [])

  // 서브메뉴 외부 클릭 시 메뉴 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (activeMenu && !target.closest('.relative')) {
        setActiveMenu(null)
      }
    }

    if (activeMenu) {
      document.addEventListener('click', handleClickOutside)
    }

    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [activeMenu])

  // 페이지 포커스 시 데이터 새로고침 및 주기적 새로고침
  useEffect(() => {
    const handleFocus = () => {
      fetchNavigations()
    }
    
    const handleNavigationRefresh = () => {
      console.log('네비게이션 강제 새로고침 이벤트 수신')
      fetchNavigations()
    }
    
    const handleNavigationOrderUpdated = (event: CustomEvent) => {
      console.log('네비게이션 순서 업데이트 이벤트 수신:', event.detail)
      // 즉시 새로고침
      fetchNavigations()
      
      // 추가로 약간의 지연 후 한 번 더 새로고침 (서버 반영 시간 고려)
      setTimeout(() => {
        fetchNavigations()
        console.log('지연된 네비게이션 새로고침 (사용자 페이지)')
      }, 1000)
    }
    
    // localStorage 변경 감지 (다른 탭에서의 업데이트)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'navigation-last-updated' && e.newValue) {
        console.log('다른 탭에서 네비게이션 업데이트 감지:', e.newValue)
        fetchNavigations()
      }
    }
    
    // 30초마다 네비게이션 데이터 새로고침 (캐시 방지)
    const interval = setInterval(() => {
      fetchNavigations()
    }, 30000)
    
    window.addEventListener('focus', handleFocus)
    window.addEventListener('navigation-refresh', handleNavigationRefresh)
    window.addEventListener('navigation-order-updated', handleNavigationOrderUpdated as EventListener)
    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('navigation-refresh', handleNavigationRefresh)
      window.removeEventListener('navigation-order-updated', handleNavigationOrderUpdated as EventListener)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  const fetchNavigations = async () => {
    try {
      // 강력한 캐시 방지를 위한 다중 파라미터
      const timestamp = new Date().getTime()
      const random = Math.random().toString(36).substring(7)
      const response = await fetch(`/api/navigations?t=${timestamp}&r=${random}&v=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0',
          'If-Modified-Since': '0',
          'If-None-Match': '*'
        }
      })
      const data = await response.json()

      if (data.ok && Array.isArray(data.data)) {
        setNavigations(data.data)
        console.log('네비게이션 데이터 새로고침 완료:', {
          count: data.data.length,
          timestamp: data.timestamp,
          fetchTime: new Date().toISOString()
        })
      } else {
        setNavigations([])
        console.warn('네비게이션 데이터가 배열이 아닙니다:', data.data)
      }
    } catch (error) {
      console.error('네비게이션 조회 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const data = await response.json()

      if (data.ok && Array.isArray(data.data)) {
        setCategories(data.data)
      } else {
        setCategories([])
        console.warn('카테고리 데이터가 배열이 아닙니다:', data.data)
      }
    } catch (error) {
      console.error('카테고리 조회 오류:', error)
    }
  }

  const handleMenuClick = (id: number) => {
    // 같은 메뉴를 클릭하면 토글, 다른 메뉴를 클릭하면 해당 메뉴 열기
    setActiveMenu(activeMenu === id ? null : id)
  }

  const handleSubmenuClick = () => {
    // 서브메뉴 클릭 시 메뉴 닫기
    setActiveMenu(null)
  }

  const renderNavigationItem = (item: NavigationItem) => {
    // 상품 목록 메뉴인 경우 카테고리 기반 하위 메뉴 생성
    const isProductsMenu = item.type === 'PRODUCTS'
    const hasChildren = item.children && Array.isArray(item.children) && item.children.length > 0
    const hasCategoryChildren = isProductsMenu && Array.isArray(categories) && categories.length > 0
    const shouldShowDropdown = hasChildren || hasCategoryChildren
    const isActive = activeMenu === item.id
    const isCurrentPage = pathname === item.url

    // 상품 목록 메뉴의 URL 결정
    const getProductMenuUrl = () => {
      if (Array.isArray(categories) && categories.length === 1) {
        // 카테고리가 1개인 경우 해당 카테고리로 직접 이동
        return `/products?category=${categories[0].id}`
      } else if (Array.isArray(categories) && categories.length > 1) {
        // 카테고리가 2개 이상인 경우 상품 목록 페이지로 이동
        return '/products'
      }
      return '/products'
    }

    return (
      <li
        key={item.id}
        className="relative"
      >
        {item.url || (isProductsMenu && Array.isArray(categories) && categories.length === 1) ? (
          <Link
            href={isProductsMenu ? getProductMenuUrl() : (item.url || '#')}
            target={item.isNewWindow ? '_blank' : '_self'}
            rel={item.isNewWindow ? 'noopener noreferrer' : undefined}
            onClick={(e) => {
              if (shouldShowDropdown) {
                e.preventDefault()
                handleMenuClick(item.id)
              } else {
                onItemClick?.()
              }
            }}
            className={`relative shrink-0 font-['Pretendard:SemiBold',_sans-serif] text-[18px] leading-[30px] transition-colors duration-200 ${
              isCurrentPage
                ? 'text-blue-600'
                : 'text-[#222222] hover:text-blue-600'
            }`}
          >
            {item.title}
            {shouldShowDropdown && (
              <svg
                className={`inline-block ml-1 w-4 h-4 transition-transform duration-200 ${
                  isActive ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            )}
          </Link>
        ) : (
          <span
            onClick={() => shouldShowDropdown ? handleMenuClick(item.id) : undefined}
            className={`relative shrink-0 font-['Pretendard:SemiBold',_sans-serif] text-[18px] leading-[30px] cursor-pointer transition-colors duration-200 ${
              isCurrentPage
                ? 'text-blue-600'
                : 'text-[#222222] hover:text-blue-600'
            }`}
          >
            {item.title}
            {shouldShowDropdown && (
              <svg
                className={`inline-block ml-1 w-4 h-4 transition-transform duration-200 ${
                  isActive ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            )}
          </span>
        )}

        {/* 하위 메뉴 */}
        {shouldShowDropdown && (
          <ul
            className={`absolute top-full left-0 w-56 bg-white border border-gray-200 rounded-lg shadow-xl z-50 transition-all duration-200 ${
              isActive
                ? 'opacity-100 visible transform translate-y-0'
                : 'opacity-0 invisible transform -translate-y-2'
            }`}
          >
            {/* 기존 하위 메뉴 */}
            {hasChildren && Array.isArray(item.children) && item.children.map((child) => (
              <li key={child.id}>
                <Link
                  href={child.url || '#'}
                  target={child.isNewWindow ? '_blank' : '_self'}
                  rel={child.isNewWindow ? 'noopener noreferrer' : undefined}
                  onClick={() => {
                    handleSubmenuClick()
                    onItemClick?.()
                  }}
                  className={`block px-6 py-3 text-[16px] font-['Pretendard:Medium',_sans-serif] transition-colors duration-200 ${
                    pathname === child.url
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-[#222222] hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  {child.title}
                </Link>
              </li>
            ))}
            
            {/* 상품 카테고리 하위 메뉴 */}
            {hasCategoryChildren && Array.isArray(categories) && categories.map((category) => (
              <li key={`category-${category.id}`}>
                <Link
                  href={`/products?category=${category.id}`}
                  onClick={() => {
                    handleSubmenuClick()
                    onItemClick?.()
                  }}
                  className={`block px-6 py-3 text-[16px] font-['Pretendard:Medium',_sans-serif] transition-colors duration-200 ${
                    pathname === `/products?category=${category.id}`
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-[#222222] hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </li>
    )
  }

  if (loading) {
    return (
      <nav className={`${className}`}>
        <ul className="flex gap-[40px] items-start">
          <li className="relative shrink-0 font-['Pretendard:SemiBold',_sans-serif] text-[18px] leading-[30px] not-italic text-[#222222] text-nowrap whitespace-pre">
            로딩 중...
          </li>
        </ul>
      </nav>
    )
  }

  if (!Array.isArray(navigations) || navigations.length === 0) {
    return null
  }

  return (
    <nav className={`${className}`}>
      <ul className="flex gap-[40px] items-start">
        {navigations.map(renderNavigationItem)}
      </ul>
    </nav>
  )
}
