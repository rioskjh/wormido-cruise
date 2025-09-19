'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminNavigation from './AdminNavigation'
import { ToastProvider } from '@/contexts/ToastContext'

interface AdminLayoutProps {
  children: React.ReactNode
  title: string
  description?: string
}

export default function AdminLayout({ children, title, description }: AdminLayoutProps) {
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // 토큰 만료 확인 함수
  const isTokenExpired = (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const currentTime = Math.floor(Date.now() / 1000)
      return payload.exp < currentTime
    } catch {
      return true
    }
  }

  // 토큰 갱신 함수
  const refreshToken = async (): Promise<string | null> => {
    try {
      const refreshTokenValue = localStorage.getItem('adminRefreshToken')
      if (!refreshTokenValue) {
        return null
      }

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: refreshTokenValue }),
      })

      const data = await response.json()
      if (data.ok) {
        localStorage.setItem('adminToken', data.data.accessToken)
        localStorage.setItem('adminRefreshToken', data.data.refreshToken)
        return data.data.accessToken
      }
      return null
    } catch (error) {
      console.error('토큰 갱신 실패:', error)
      return null
    }
  }

  useEffect(() => {
    const checkAuth = async () => {
      const adminToken = localStorage.getItem('adminToken')
      
      if (!adminToken) {
        router.push('/admin/login')
        return
      }

      // 토큰 만료 확인
      if (isTokenExpired(adminToken)) {
        console.log('토큰이 만료되어 갱신을 시도합니다.')
        const newToken = await refreshToken()
        if (newToken) {
          console.log('토큰 갱신 성공')
        } else {
          // 토큰 갱신 실패 시 로그인 페이지로 이동
          localStorage.removeItem('adminToken')
          localStorage.removeItem('adminRefreshToken')
          router.push('/admin/login')
          return
        }
      }

      setIsLoading(false)
    }

    checkAuth()
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminRefreshToken')
    router.push('/admin/login')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg">로딩 중...</div>
      </div>
    )
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-50 flex">
        {/* 좌측 네비게이션 */}
        <AdminNavigation onLogout={handleLogout} />
        
        {/* 메인 콘텐츠 영역 */}
        <div className="flex-1 flex flex-col">
          {/* 상단 헤더 */}
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="px-6 py-4">
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              {description && (
                <p className="text-gray-600 mt-1">{description}</p>
              )}
            </div>
          </header>

          {/* 메인 콘텐츠 */}
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  )
}
