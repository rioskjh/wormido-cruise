'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useToast } from '@/contexts/ToastContext'

interface User {
  id: number
  username: string
  nickname: string
  role: string
}

export default function UserNavigation() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { showSuccess } = useToast()

  useEffect(() => {
    checkAuthStatus()
    
    // localStorage 변경 감지
    const handleStorageChange = () => {
      checkAuthStatus()
    }
    
    // storage 이벤트 리스너 등록 (다른 탭에서의 변경 감지)
    window.addEventListener('storage', handleStorageChange)
    
    // 커스텀 이벤트 리스너 등록 (같은 탭에서의 변경 감지)
    window.addEventListener('authStateChanged', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('authStateChanged', handleStorageChange)
    }
  }, [])

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        setLoading(false)
        return
      }

      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.data.user)
      } else {
        // 토큰이 유효하지 않으면 제거
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
      }
    } catch (error) {
      console.error('Auth check error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      // 로컬 스토리지에서 토큰 제거
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      
      setUser(null)
      showSuccess('로그아웃 완료', '성공적으로 로그아웃되었습니다.')
      
      // 인증 상태 변경 이벤트 발생
      window.dispatchEvent(new Event('authStateChanged'))
      
      // 메인 페이지로 리다이렉트
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  if (loading) {
    return (
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                🚢 Wormi Cruise
              </h1>
              <p className="text-sm text-gray-600">월미도 크루즈 예약 시스템</p>
            </div>
            <div className="animate-pulse bg-gray-200 h-10 w-32 rounded"></div>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div>
            <Link href="/" className="block">
              <h1 className="text-2xl font-bold text-gray-900">
                🚢 Wormi Cruise
              </h1>
              <p className="text-sm text-gray-600">월미도 크루즈 예약 시스템</p>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              // 로그인된 상태
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600">
                  안녕하세요, <span className="font-medium text-gray-900">{user.nickname}</span>님
                </div>
                <Link 
                  href="/profile" 
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  정보수정
                </Link>
                <Link 
                  href="/reservations" 
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-100"
                >
                  내 예약
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              // 로그인되지 않은 상태
              <div className="flex items-center space-x-4">
                <Link 
                  href="/login" 
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  로그인
                </Link>
                <Link 
                  href="/register" 
                  className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  회원가입
                </Link>
              </div>
            )}
            
            <Link 
              href="/admin/login" 
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              관리자
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
