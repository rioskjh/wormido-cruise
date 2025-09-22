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
  const [cartItemCount, setCartItemCount] = useState(0)
  const router = useRouter()
  const { showSuccess } = useToast()

  useEffect(() => {
    checkAuthStatus()
    updateCartItemCount()
    
    // localStorage 변경 감지
    const handleStorageChange = () => {
      checkAuthStatus()
      updateCartItemCount()
    }
    
    // storage 이벤트 리스너 등록 (다른 탭에서의 변경 감지)
    window.addEventListener('storage', handleStorageChange)
    
    // 커스텀 이벤트 리스너 등록 (같은 탭에서의 변경 감지)
    window.addEventListener('authStateChanged', handleStorageChange)
    window.addEventListener('cartUpdated', updateCartItemCount)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('authStateChanged', handleStorageChange)
      window.removeEventListener('cartUpdated', updateCartItemCount)
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

  const updateCartItemCount = () => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]')
      setCartItemCount(cart.length)
    } catch (error) {
      setCartItemCount(0)
    }
  }

  const handleCartClick = () => {
    // 장바구니 페이지로 이동 (로그인 상태와 관계없이 접근 가능)
    router.push('/cart')
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
      <header className="bg-white relative w-full">
        <div className="flex flex-row items-center relative size-full">
          <div className="box-border content-stretch flex items-center justify-between px-[50px] py-[20px] relative w-full">
            <div className="h-[46px] overflow-clip relative shrink-0 w-[250px]">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-design-purple rounded-md flex items-center justify-center">
                  <span className="text-white text-lg">🚢</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-design-gray font-pretendard">
                    Wormi Cruise
                  </h1>
                </div>
              </div>
            </div>
            <div className="animate-pulse bg-gray-200 h-10 w-32 rounded"></div>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="bg-white relative w-full">
      <div className="flex flex-row items-center relative size-full">
        <div className="box-border content-stretch flex items-center justify-between px-4 md:px-[50px] py-[20px] relative w-full">
          {/* 로고 */}
          <div className="h-[46px] overflow-clip relative shrink-0 w-[250px]">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-design-purple rounded-md flex items-center justify-center">
                <span className="text-white text-lg">🚢</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-design-gray font-pretendard">
                  Wormi Cruise
                </h1>
              </div>
            </Link>
          </div>

          {/* 메뉴 - 데스크톱에서만 표시 */}
          <div className="hidden lg:flex content-stretch font-pretendard gap-[80px] items-start justify-start leading-[0] not-italic relative shrink-0 text-design-gray text-[18px] text-nowrap">
            <Link href="/" className="relative shrink-0 hover:text-design-blue transition-colors">
              <p className="leading-[30px] text-nowrap whitespace-pre">상품예약</p>
            </Link>
            <Link href="/" className="relative shrink-0 hover:text-design-blue transition-colors">
              <p className="leading-[30px] text-nowrap whitespace-pre">단체여행</p>
            </Link>
            <Link href="/" className="relative shrink-0 hover:text-design-blue transition-colors">
              <p className="leading-[30px] text-nowrap whitespace-pre">운항정보</p>
            </Link>
            <Link href="/" className="relative shrink-0 hover:text-design-blue transition-colors">
              <p className="leading-[30px] text-nowrap whitespace-pre">고객센터</p>
            </Link>
            <Link href="/" className="relative shrink-0 hover:text-design-blue transition-colors">
              <p className="leading-[30px] text-nowrap whitespace-pre">회사소개</p>
            </Link>
          </div>

          {/* 우측 버튼들 */}
          <div className="content-stretch flex gap-2 md:gap-[30px] items-center justify-start relative shrink-0">
            {/* 장바구니 버튼 */}
            <button
              onClick={handleCartClick}
              className="relative flex items-center gap-2 hover:text-design-blue transition-colors border border-gray-300 px-2 py-1 rounded"
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <svg className="w-4 h-4 text-design-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                </svg>
              </div>
              <span className="text-design-gray text-sm font-pretendard hidden sm:inline">장바구니</span>
              {cartItemCount > 0 && (
                <div className="absolute -top-2 -right-2 bg-design-purple text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-pretendard font-medium">
                  {cartItemCount}
                </div>
              )}
            </button>

            {user ? (
              // 로그인된 상태
              <div className="flex items-center gap-[10px]">
                <Link 
                  href="/profile" 
                  className="content-stretch flex gap-[10px] items-center justify-start relative shrink-0"
                >
                  <div className="w-5 h-5 flex items-center justify-center">
                    <svg className="w-4 h-4 text-design-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="font-pretendard leading-[0] not-italic relative shrink-0 text-design-gray text-[15px] text-center text-nowrap">
                    <p className="leading-[20px] whitespace-pre">정보수정</p>
                  </div>
                </Link>
                <Link 
                  href="/reservations" 
                  className="content-stretch flex gap-[10px] items-center justify-start relative shrink-0"
                >
                  <div className="w-5 h-5 flex items-center justify-center">
                    <svg className="w-4 h-4 text-design-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div className="font-pretendard leading-[0] not-italic relative shrink-0 text-design-gray text-[15px] text-center text-nowrap">
                    <p className="leading-[20px] whitespace-pre">예약조회</p>
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="content-stretch flex gap-[10px] items-center justify-start relative shrink-0 hover:text-design-blue transition-colors"
                >
                  <div className="w-5 h-5 flex items-center justify-center">
                    <svg className="w-4 h-4 text-design-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </div>
                  <div className="font-pretendard leading-[0] not-italic relative shrink-0 text-design-gray text-[15px] text-center text-nowrap">
                    <p className="leading-[20px] whitespace-pre">로그아웃</p>
                  </div>
                </button>
              </div>
            ) : (
              // 로그인되지 않은 상태
              <div className="flex items-center gap-[10px]">
                <Link 
                  href="/login" 
                  className="content-stretch flex gap-[10px] items-center justify-start relative shrink-0"
                >
                  <div className="w-5 h-5 flex items-center justify-center">
                    <svg className="w-4 h-4 text-design-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                  </div>
                  <div className="font-pretendard leading-[0] not-italic relative shrink-0 text-design-gray text-[15px] text-center text-nowrap">
                    <p className="leading-[20px] whitespace-pre">로그인</p>
                  </div>
                </Link>
                <Link 
                  href="/register" 
                  className="content-stretch flex gap-[10px] items-center justify-start relative shrink-0"
                >
                  <div className="w-5 h-5 flex items-center justify-center">
                    <svg className="w-4 h-4 text-design-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div className="font-pretendard leading-[0] not-italic relative shrink-0 text-design-gray text-[15px] text-center text-nowrap">
                    <p className="leading-[20px] whitespace-pre">회원가입</p>
                  </div>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
