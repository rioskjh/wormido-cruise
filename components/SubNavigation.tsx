'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Home, ChevronRight } from 'lucide-react'

interface SubNavigationItem {
  label: string
  href?: string
  children?: SubNavigationItem[]
}

interface SubNavigationProps {
  items: SubNavigationItem[]
}

export default function SubNavigation({ items }: SubNavigationProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  const renderMenuItem = (item: SubNavigationItem, index: number, level: number = 1) => {
    const hasChildren = item.children && item.children.length > 0
    const isHovered = hoveredItem === `${level}-${index}`

    return (
      <div
        key={`${level}-${index}`}
        className="relative"
        onMouseEnter={() => hasChildren && setHoveredItem(`${level}-${index}`)}
        onMouseLeave={() => hasChildren && setHoveredItem(null)}
      >
        <div className="flex items-center justify-between w-[150px]">
          {item.href ? (
            <Link
              href={item.href}
              className="font-['Pretendard:Medium',_sans-serif] text-[17px] text-[#222222] leading-[30px] hover:text-[#3c64d6] transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="font-['Pretendard:Medium',_sans-serif] text-[17px] text-[#222222] leading-[30px]">
              {item.label}
            </span>
          )}
          
          {hasChildren && (
            <div className="flex items-center justify-center">
              <div className={`transform transition-transform duration-200 ${isHovered ? 'rotate-180' : ''}`}>
                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* 드롭다운 메뉴 */}
        {hasChildren && isHovered && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-[#dddddd] rounded-lg shadow-lg z-50 min-w-[200px]">
            <div className="py-2">
              {item.children!.map((child, childIndex) => (
                <div key={childIndex} className="px-4 py-2 hover:bg-gray-50">
                  {child.href ? (
                    <Link
                      href={child.href}
                      className="font-['Pretendard:Regular',_sans-serif] text-[16px] text-[#222222] leading-[28px] hover:text-[#3c64d6] transition-colors block"
                    >
                      {child.label}
                    </Link>
                  ) : (
                    <span className="font-['Pretendard:Regular',_sans-serif] text-[16px] text-[#222222] leading-[28px] block">
                      {child.label}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <nav className="bg-white border-b border-[#dddddd] py-5">
      <div className="container mx-auto px-4 max-w-[1200px]">
        <div className="flex items-center gap-[30px]">
          {/* 홈 버튼 */}
          <Link href="/" className="flex items-center hover:text-[#3c64d6] transition-colors">
            <Home className="w-6 h-6 text-[#222222]" />
          </Link>

          {/* 메뉴 아이템들 */}
          {items.map((item, index) => (
            <div key={index} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="w-4 h-4 mx-2 text-[#666666]" />
              )}
              {renderMenuItem(item, index, 1)}
            </div>
          ))}
        </div>
      </div>
    </nav>
  )
}
