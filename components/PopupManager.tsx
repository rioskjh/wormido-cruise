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
  createdAt: string
  updatedAt: string
}

export default function PopupManager() {
  const [popups, setPopups] = useState<Popup[]>([])
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()

  useEffect(() => {
    loadPopups()
  }, [pathname])

  const loadPopups = async () => {
    try {
      const response = await fetch(`/api/popups?path=${encodeURIComponent(pathname)}`)
      const data = await response.json()
      
      if (data.ok) {
        setPopups(data.data)
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

  if (loading || popups.length === 0) {
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
              {/* 팝업 헤더 */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{typeIcon}</span>
                  <h3 className="font-semibold text-lg">{popup.title}</h3>
                </div>
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
                {popup.content}
              </div>

              {/* 팝업 푸터 */}
              <div className="flex justify-end mt-4 pt-3 border-t border-gray-200">
                <button
                  onClick={() => {
                    setPopups(prev => prev.filter(p => p.id !== popup.id))
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                >
                  확인
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
