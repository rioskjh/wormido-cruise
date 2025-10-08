'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useToast } from '@/contexts/ToastContext'
import DynamicNavigation from './DynamicNavigation'
import MobileNavigation from './MobileNavigation'

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
      <header className="bg-white relative shrink-0 w-full" data-name="header">
        <div className="flex flex-row items-center size-full">
          <div className="box-border content-stretch flex items-center justify-between px-[50px] py-[20px] relative w-full">
            <div className="h-[46px] overflow-clip relative shrink-0 w-[250px]" data-name="logo">
              <Link href="/" className="flex items-center">
                <img
                  src="/images/logo.png"
                  alt="월미도 해양관광"
                  width={200}
                  height={46}
                  className="h-full w-auto object-contain"
                />
              </Link>
            </div>
            <div className="content-stretch flex font-['Pretendard:SemiBold',_sans-serif] gap-[80px] items-start leading-[30px] not-italic relative shrink-0 text-[#222222] text-[18px] text-nowrap whitespace-pre" data-name="menu">
              <div className="animate-pulse bg-gray-200 h-6 w-20 rounded"></div>
            </div>
            <div className="content-stretch flex gap-[30px] items-center relative shrink-0">
              <div className="animate-pulse bg-gray-200 h-6 w-16 rounded"></div>
            </div>
          </div>
        </div>
      </header>
    )
  }

  return (
    <>
      {/* 모바일 네비게이션 */}
      <MobileNavigation 
        user={user}
        cartItemCount={cartItemCount}
        onCartClick={handleCartClick}
        onLogout={handleLogout}
      />

      {/* 데스크톱 네비게이션 */}
      <header className="bg-white relative shrink-0 w-full hidden md:block" data-name="header">
        <div className="flex flex-row items-center size-full">
          <div className="box-border content-stretch flex items-center justify-between px-[50px] py-[20px] relative w-full">
            {/* 로고 */}
            <div className="h-[46px] overflow-clip relative shrink-0 w-[250px]" data-name="logo">
              <Link href="/" className="flex items-center">
                <img
                  src="/images/logo.png"
                  alt="월미도 해양관광"
                  width={200}
                  height={46}
                  className="h-full w-auto object-contain"
                />
              </Link>
            </div>

            {/* 메뉴 - 디자인 파일과 정확히 동일한 스타일 */}
            <div className="content-stretch flex font-['Pretendard:SemiBold',_sans-serif] gap-[80px] items-start leading-[30px] not-italic relative shrink-0 text-[#222222] text-[18px] text-nowrap whitespace-pre" data-name="menu">
              <DynamicNavigation />
            </div>

            {/* 우측 버튼들 - 디자인 파일과 정확히 동일한 스타일 */}
            <div className="content-stretch flex gap-[30px] items-center relative shrink-0">
              {user ? (
                // 로그인된 상태 - 디자인 파일과 정확히 동일한 스타일
                <>
                  <Link 
                    href="/profile" 
                    className="content-stretch flex gap-[10px] items-center relative shrink-0"
                  >
                    <div className="h-[20px] relative shrink-0 w-[18px]" data-name="Group">
                      <div className="absolute inset-[-5%_-5.56%]">
                        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 22">
                          <g id="Group">
                            <path d="M10 9a3 3 0 100-6 3 3 0 000 6z" id="Vector" stroke="var(--stroke-0, #222222)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                            <path d="M6.168 15.849A4 4 0 0110 13c1.876 0 3.416 1.679 3.832 3.849" id="Vector_2" stroke="var(--stroke-0, #222222)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                          </g>
                        </svg>
                      </div>
                    </div>
                    <p className="font-['Pretendard:SemiBold',_sans-serif] leading-[20px] not-italic relative shrink-0 text-[#222222] text-[15px] text-center text-nowrap whitespace-pre">정보수정</p>
                  </Link>
                  <Link 
                    href="/reservations" 
                    className="content-stretch flex gap-[10px] items-center relative shrink-0"
                  >
                    <div className="relative shrink-0 size-[20px]" data-name="Group">
                      <div className="absolute inset-[-5%]">
                        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 22">
                          <g id="Group">
                            <path d="M7 1V5M15 1V5M1 9H21" id="Vector" stroke="var(--stroke-0, #222222)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                          </g>
                        </svg>
                      </div>
                    </div>
                    <p className="font-['Pretendard:SemiBold',_sans-serif] leading-[20px] not-italic relative shrink-0 text-[#222222] text-[15px] text-center text-nowrap whitespace-pre">예약조회</p>
                  </Link>
                </>
              ) : (
                // 로그인되지 않은 상태 - 디자인 파일과 정확히 동일한 스타일
                <>
                  <Link 
                    href="/login" 
                    className="content-stretch flex gap-[10px] items-center relative shrink-0"
                  >
                    <div className="h-[20px] relative shrink-0 w-[18px]" data-name="Group">
                      <div className="absolute inset-[-5%_-5.56%]">
                        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 22">
                          <g id="Group">
                            <path d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" id="Vector" stroke="var(--stroke-0, #222222)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                          </g>
                        </svg>
                      </div>
                    </div>
                    <p className="font-['Pretendard:SemiBold',_sans-serif] leading-[20px] not-italic relative shrink-0 text-[#222222] text-[15px] text-center text-nowrap whitespace-pre">로그인</p>
                  </Link>
                  <Link 
                    href="/register" 
                    className="content-stretch flex gap-[10px] items-center relative shrink-0"
                  >
                    <div className="relative shrink-0 size-[20px]" data-name="Group">
                      <div className="absolute inset-[-5%]">
                        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 22">
                          <g id="Group">
                            <path d="M7 1V5M15 1V5M1 9H21" id="Vector" stroke="var(--stroke-0, #222222)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                          </g>
                        </svg>
                      </div>
                    </div>
                    <p className="font-['Pretendard:SemiBold',_sans-serif] leading-[20px] not-italic relative shrink-0 text-[#222222] text-[15px] text-center text-nowrap whitespace-pre">예약조회</p>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  )
}
