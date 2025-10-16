'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useToast } from '@/contexts/ToastContext'
import DynamicNavigation from './DynamicNavigation'

interface User {
  id: number
  username: string
  nickname: string
  role: string
}

interface MobileNavigationProps {
  user: User | null
  cartItemCount: number
  onCartClick: () => void
  onLogout: () => void
}

export default function MobileNavigation({ user, cartItemCount, onCartClick, onLogout }: MobileNavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  return (
    <>
      {/* 모바일 네비게이션 헤더 */}
      <header className="bg-white relative w-full md:hidden">
        <div className="flex flex-row items-center relative size-full">
          <div className="box-border content-stretch flex items-center justify-between px-[15px] py-[20px] relative w-full">
            {/* 로고 */}
            <div className="h-[30px] overflow-clip relative shrink-0 w-[161px]">
              <Link href="/" className="flex items-center">
                <img
                  src="/images/logo.png"
                  alt="월미도 해양관광"
                  width={161}
                  height={30}
                  className="h-full w-auto object-contain"
                />
              </Link>
            </div>

            {/* 우측 아이콘들 */}
            <div className="content-stretch flex gap-[20px] items-center justify-start relative shrink-0">
              {/* 장바구니 아이콘 */}
              <button
                onClick={onCartClick}
                className="relative flex items-center justify-center w-6 h-6"
              >
                <svg className="w-5 h-5 text-[#222222]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                </svg>
                {cartItemCount > 0 && (
                  <div className="absolute -top-1 -right-1 bg-design-purple text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-pretendard font-medium text-[10px]">
                    {cartItemCount}
                  </div>
                )}
              </button>

              {/* 로그인 아이콘 */}
              {user ? (
                <Link 
                  href="/profile" 
                  className="flex items-center justify-center w-6 h-6"
                >
                  <svg className="w-5 h-5 text-[#222222]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </Link>
              ) : (
                <Link 
                  href="/login" 
                  className="flex items-center justify-center w-6 h-6"
                >
                  <svg className="w-5 h-5 text-[#222222]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                </Link>
              )}

              {/* 햄버거 메뉴 */}
              <button
                onClick={toggleMenu}
                className="flex items-center justify-center w-6 h-6"
              >
                <svg className="w-5 h-5 text-[#222222]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 모바일 메뉴 오버레이 */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* 배경 오버레이 */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={closeMenu}
          />
          
          {/* 메뉴 패널 */}
          <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-lg">
            <div className="flex flex-col h-full">
              {/* 메뉴 헤더 */}
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold text-[#222222]">메뉴</h2>
                <button
                  onClick={closeMenu}
                  className="flex items-center justify-center w-8 h-8"
                >
                  <svg className="w-6 h-6 text-[#222222]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* 메뉴 내용 */}
              <div className="flex-1 overflow-y-auto p-4">
                {/* 네비게이션 메뉴 */}
                <div className="mb-6">
                  <DynamicNavigation 
                    className="flex flex-col gap-4 text-[#222222] text-lg"
                    onItemClick={closeMenu}
                  />
                </div>

                {/* 사용자 메뉴 */}
                <div className="border-t pt-4">
                  {user ? (
                    <div className="space-y-3">
                      <div className="text-sm text-[#666666] mb-2">
                        안녕하세요, {user.nickname}님
                      </div>
                      <Link 
                        href="/profile" 
                        className="flex items-center gap-3 text-[#222222] text-lg py-2"
                        onClick={closeMenu}
                      >
                        <img alt="정보수정" className="w-5 h-5 object-contain" src="/images/login-icon.png" />
                        정보수정
                      </Link>
                      <Link 
                        href="/reservations" 
                        className="flex items-center gap-3 text-[#222222] text-lg py-2"
                        onClick={closeMenu}
                      >
                        <img alt="예약조회" className="w-5 h-5 object-contain" src="/images/calendar-icon.png" />
                        예약조회
                      </Link>
                      <button
                        onClick={() => {
                          onLogout()
                          closeMenu()
                        }}
                        className="flex items-center gap-3 text-[#222222] text-lg py-2 w-full text-left"
                      >
                        <img alt="로그아웃" className="w-5 h-5 object-contain" src="/images/logout-icon.png" />
                        로그아웃
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Link 
                        href="/login" 
                        className="flex items-center gap-3 text-[#222222] text-lg py-2"
                        onClick={closeMenu}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                        로그인
                      </Link>
                      <Link 
                        href="/register" 
                        className="flex items-center gap-3 text-[#222222] text-lg py-2"
                        onClick={closeMenu}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        회원가입
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
