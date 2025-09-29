'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface AdminNavigationProps {
  onLogout: () => void
}

export default function AdminNavigation({ onLogout }: AdminNavigationProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const navigationItems = [
    {
      name: '대시보드',
      href: '/admin/dashboard',
      icon: '📊',
      current: pathname === '/admin/dashboard'
    },
    {
      name: '예약 관리',
      href: '/admin/reservations',
      icon: '📋',
      current: pathname === '/admin/reservations'
    },
    {
      name: '상품 관리',
      href: '/admin/products',
      icon: '🚢',
      current: pathname === '/admin/products'
    },
    {
      name: '카테고리 관리',
      href: '/admin/categories',
      icon: '📂',
      current: pathname === '/admin/categories'
    },
    {
      name: '회원 관리',
      href: '/admin/members',
      icon: '👥',
      current: pathname === '/admin/members'
    },
    {
      name: '팝업 관리',
      href: '/admin/popups',
      icon: '💬',
      current: pathname === '/admin/popups'
    },
    {
      name: '게시판 관리',
      href: '/admin/board',
      icon: '📝',
      current: pathname === '/admin/board'
    },
    {
      name: '컨텐츠 관리',
      href: '/admin/contents',
      icon: '📄',
      current: pathname.startsWith('/admin/contents')
    },
    {
      name: '네비게이션 관리',
      href: '/admin/navigations',
      icon: '🧭',
      current: pathname.startsWith('/admin/navigations')
    },
    {
      name: '설정',
      href: '/admin/settings',
      icon: '⚙️',
      current: pathname === '/admin/settings'
    }
  ]

  const handleNavigation = (href: string) => {
    router.push(href)
  }

  return (
    <div className={`bg-gray-900 text-white transition-all duration-300 flex flex-col h-full ${isCollapsed ? 'w-16' : 'w-64'}`}>
      {/* 헤더 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        {!isCollapsed && (
          <div>
            <h1 className="text-xl font-bold">Wormi Cruise</h1>
            <p className="text-sm text-gray-400">관리자 시스템</p>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-md hover:bg-gray-700 transition-colors"
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>

      {/* 네비게이션 메뉴 */}
      <nav className="mt-4 flex-1">
        <ul className="space-y-1 px-2">
          {Array.isArray(navigationItems) && navigationItems.map((item) => (
            <li key={item.name}>
              <button
                onClick={() => handleNavigation(item.href)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  item.current
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <span className="text-lg mr-3">{item.icon}</span>
                {!isCollapsed && <span>{item.name}</span>}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* 하단 사용자 정보 및 로그아웃 */}
      <div className="p-4 border-t border-gray-700">
        {!isCollapsed && (
          <div className="mb-3">
            <p className="text-sm font-medium text-white">관리자</p>
            <p className="text-xs text-gray-400">admin@wormido-cruise.com</p>
          </div>
        )}
        <button
          onClick={onLogout}
          className={`w-full flex items-center px-3 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-700 hover:text-white transition-colors ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          <span className="text-lg mr-3">🚪</span>
          {!isCollapsed && <span>로그아웃</span>}
        </button>
      </div>
    </div>
  )
}
