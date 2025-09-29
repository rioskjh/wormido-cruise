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
}

export default function DynamicNavigation({ className = '' }: DynamicNavigationProps) {
  const [navigations, setNavigations] = useState<NavigationItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [activeMenu, setActiveMenu] = useState<number | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    fetchNavigations()
    fetchCategories()
  }, [])

  // 페이지 포커스 시 데이터 새로고침
  useEffect(() => {
    const handleFocus = () => {
      fetchNavigations()
    }
    
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  const fetchNavigations = async () => {
    try {
      const response = await fetch('/api/navigations', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      const data = await response.json()

      if (data.ok) {
        setNavigations(data.data)
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

      if (data.ok) {
        setCategories(data.data)
      }
    } catch (error) {
      console.error('카테고리 조회 오류:', error)
    }
  }

  const handleMouseEnter = (id: number) => {
    setActiveMenu(id)
  }

  const handleMouseLeave = () => {
    setActiveMenu(null)
  }

  const renderNavigationItem = (item: NavigationItem) => {
    // 상품 목록 메뉴인 경우 카테고리 기반 하위 메뉴 생성
    const isProductsMenu = item.type === 'PRODUCTS'
    const hasChildren = item.children && item.children.length > 0
    const hasCategoryChildren = isProductsMenu && categories.length > 0
    const shouldShowDropdown = hasChildren || hasCategoryChildren
    const isActive = activeMenu === item.id
    const isCurrentPage = pathname === item.url

    // 상품 목록 메뉴의 URL 결정
    const getProductMenuUrl = () => {
      if (categories.length === 1) {
        // 카테고리가 1개인 경우 해당 카테고리로 직접 이동
        return `/products?category=${categories[0].id}`
      } else if (categories.length > 1) {
        // 카테고리가 2개 이상인 경우 상품 목록 페이지로 이동
        return '/products'
      }
      return '/products'
    }

    return (
      <li
        key={item.id}
        className="relative"
        onMouseEnter={() => handleMouseEnter(item.id)}
        onMouseLeave={handleMouseLeave}
      >
        {item.url || (isProductsMenu && categories.length === 1) ? (
          <Link
            href={isProductsMenu ? getProductMenuUrl() : (item.url || '#')}
            target={item.isNewWindow ? '_blank' : '_self'}
            rel={item.isNewWindow ? 'noopener noreferrer' : undefined}
            className={`block px-4 py-2 text-sm font-medium transition-colors duration-200 ${
              isCurrentPage
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
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
            className={`block px-4 py-2 text-sm font-medium cursor-pointer transition-colors duration-200 ${
              isCurrentPage
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
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
            className={`absolute top-full left-0 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50 transition-all duration-200 ${
              isActive
                ? 'opacity-100 visible transform translate-y-0'
                : 'opacity-0 invisible transform -translate-y-2'
            }`}
          >
            {/* 기존 하위 메뉴 */}
            {hasChildren && item.children.map((child) => (
              <li key={child.id}>
                <Link
                  href={child.url || '#'}
                  target={child.isNewWindow ? '_blank' : '_self'}
                  rel={child.isNewWindow ? 'noopener noreferrer' : undefined}
                  className={`block px-4 py-2 text-sm transition-colors duration-200 ${
                    pathname === child.url
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  {child.title}
                </Link>
              </li>
            ))}
            
            {/* 상품 카테고리 하위 메뉴 */}
            {hasCategoryChildren && categories.map((category) => (
              <li key={`category-${category.id}`}>
                <Link
                  href={`/products?category=${category.id}`}
                  className={`block px-4 py-2 text-sm transition-colors duration-200 ${
                    pathname === `/products?category=${category.id}`
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
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
        <ul className="flex space-x-1">
          <li className="px-4 py-2 text-sm text-gray-500">로딩 중...</li>
        </ul>
      </nav>
    )
  }

  if (navigations.length === 0) {
    return null
  }

  return (
    <nav className={`${className}`}>
      <ul className="flex space-x-1">
        {navigations.map(renderNavigationItem)}
      </ul>
    </nav>
  )
}
