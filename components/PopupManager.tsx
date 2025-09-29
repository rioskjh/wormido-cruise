'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

interface Popup {
  id: number
  title: string
  content: string
  type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR' | 'PROMOTION' | 'NOTICE'
  position: 'CENTER' | 'TOP' | 'BOTTOM' | 'LEFT' | 'RIGHT' | 'TOP_LEFT' | 'TOP_RIGHT' | 'BOTTOM_LEFT' | 'BOTTOM_RIGHT'
  size: 'SMALL' | 'MEDIUM' | 'LARGE' | 'FULLSCREEN'
  isActive: boolean
  startDate?: string
  endDate?: string
  showCount: number
  maxShow?: number
  targetPages?: string
  excludePages?: string
  width?: number
  height?: number
  backgroundColor?: string
  textColor?: string
  borderColor?: string
  borderRadius?: number
  zIndex: number
  // 에디터 및 이미지 관련 필드
  contentHtml?: string
  // 쿠키 관련 필드
  showDontShowToday: boolean
  cookieExpireHours: number
  createdAt: string
  updatedAt: string
}

export default function PopupManager() {
  const [popups, setPopups] = useState<Popup[]>([])
  const [loading, setLoading] = useState(true)
  const [dontShowToday, setDontShowToday] = useState<{ [key: number]: boolean }>({})
  const pathname = usePathname()

  // 관리자 페이지에서는 팝업을 표시하지 않음
  const isAdminPage = pathname.startsWith('/admin')
  
  // 메인 페이지에서만 팝업을 표시
  const isMainPage = pathname === '/'

  // 쿠키 관련 함수들
  const setCookie = (name: string, value: string, hours: number) => {
    const expires = new Date()
    expires.setTime(expires.getTime() + (hours * 60 * 60 * 1000))
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`
  }

  const getCookie = (name: string): string | null => {
    const nameEQ = name + "="
    const ca = document.cookie.split(';')
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i]
      while (c.charAt(0) === ' ') c = c.substring(1, c.length)
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
    }
    return null
  }

  const isPopupBlocked = (popupId: number): boolean => {
    const cookieName = `popup_blocked_${popupId}`
    return getCookie(cookieName) === 'true'
  }

  const blockPopup = (popupId: number, hours: number) => {
    const cookieName = `popup_blocked_${popupId}`
    setCookie(cookieName, 'true', hours)
  }

  useEffect(() => {
    if (!isAdminPage && isMainPage) {
      loadPopups()
    } else {
      // 메인 페이지가 아닌 경우 팝업 숨기기
      setPopups([])
      setLoading(false)
    }
  }, [pathname, isAdminPage, isMainPage])

  const loadPopups = async () => {
    try {
      const response = await fetch(`/api/popups?path=${encodeURIComponent(pathname)}`)
      const data = await response.json()
      
      if (data.ok) {
        // 쿠키로 차단된 팝업 필터링
        const filteredPopups = data.data.filter((popup: Popup) => !isPopupBlocked(popup.id))
        setPopups(filteredPopups)
      }
    } catch (error) {
      console.error('Failed to load popups:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPositionClasses = (position: Popup['position']) => {
    const positions = {
      CENTER: 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
      TOP: 'top-4 left-1/2 transform -translate-x-1/2',
      BOTTOM: 'bottom-4 left-1/2 transform -translate-x-1/2',
      LEFT: 'top-1/2 left-4 transform -translate-y-1/2',
      RIGHT: 'top-1/2 right-4 transform -translate-y-1/2',
      TOP_LEFT: 'top-4 left-4',
      TOP_RIGHT: 'top-4 right-4',
      BOTTOM_LEFT: 'bottom-4 left-4',
      BOTTOM_RIGHT: 'bottom-4 right-4'
    }
    return positions[position]
  }

  const getSizeClasses = (size: Popup['size'], width?: number, height?: number) => {
    if (size === 'FULLSCREEN') {
      return { className: 'w-full h-full max-w-none max-h-none', width: undefined, height: undefined }
    }

    const sizes = {
      SMALL: 'w-80 max-w-sm',
      MEDIUM: 'w-96 max-w-md',
      LARGE: 'w-[32rem] max-w-lg',
      FULLSCREEN: 'w-full h-full max-w-none max-h-none'
    }
    return { className: sizes[size], width: width ? `${width}px` : undefined, height: height ? `${height}px` : undefined }
  }

  const getTypeIcon = (type: Popup['type']) => {
    const icons = {
      INFO: 'ℹ️',
      WARNING: '⚠️',
      SUCCESS: '✅',
      ERROR: '❌',
      PROMOTION: '🎉',
      NOTICE: '📢'
    }
    return icons[type]
  }

  const getTypeStyles = (type: Popup['type']) => {
    const styles = {
      INFO: 'border-blue-200 bg-blue-50',
      WARNING: 'border-yellow-200 bg-yellow-50',
      SUCCESS: 'border-green-200 bg-green-50',
      ERROR: 'border-red-200 bg-red-50',
      PROMOTION: 'border-purple-200 bg-purple-50',
      NOTICE: 'border-gray-200 bg-gray-50'
    }
    return styles[type]
  }

  if (loading || !Array.isArray(popups) || popups.length === 0) {
    return null
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {popups.map((popup) => {
        const positionClasses = getPositionClasses(popup.position)
        const sizeConfig = getSizeClasses(popup.size, popup.width, popup.height)
        const typeIcon = getTypeIcon(popup.type)
        const typeStyles = getTypeStyles(popup.type)

        return (
          <div
            key={popup.id}
            className={`absolute ${positionClasses} pointer-events-auto`}
            style={{ zIndex: popup.zIndex }}
          >
            <div
              className={`
                ${sizeConfig.className || ''}
                border-2 rounded-lg shadow-lg p-4
                ${typeStyles}
                animate-in fade-in-0 zoom-in-95 duration-300
              `}
              style={{
                backgroundColor: popup.backgroundColor,
                color: popup.textColor,
                borderColor: popup.borderColor,
                borderRadius: popup.borderRadius ? `${popup.borderRadius}px` : undefined,
                ...(sizeConfig.width && sizeConfig.height ? {
                  width: sizeConfig.width,
                  height: sizeConfig.height
                } : {})
              }}
            >
              {/* 팝업 헤더 - 닫기 버튼만 */}
              <div className="flex justify-end mb-3">
                <button
                  onClick={() => {
                    setPopups(prev => prev.filter(p => p.id !== popup.id))
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* 팝업 내용 */}
              <div className="text-sm leading-relaxed">
                {popup.contentHtml ? (
                  <div 
                    dangerouslySetInnerHTML={{ __html: popup.contentHtml }}
                    className="prose prose-sm max-w-none"
                  />
                ) : (
                  popup.content
                )}
              </div>

              {/* 팝업 푸터 - 체크박스와 닫기 버튼을 한 줄에 배치 */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
                {popup.showDontShowToday ? (
                  <label className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={dontShowToday[popup.id] || false}
                      onChange={(e) => {
                        setDontShowToday(prev => ({
                          ...prev,
                          [popup.id]: e.target.checked
                        }))
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span>오늘 하루 이 창 보지 않기</span>
                  </label>
                ) : (
                  <div></div>
                )}
                
                <button
                  onClick={() => {
                    // "오늘 하루 보지 않기"가 체크된 경우 쿠키 설정
                    if (dontShowToday[popup.id]) {
                      blockPopup(popup.id, popup.cookieExpireHours)
                    }
                    setPopups(prev => prev.filter(p => p.id !== popup.id))
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
