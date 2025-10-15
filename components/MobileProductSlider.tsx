'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

interface Product {
  id: number
  name: string
  description: string
  basePrice: number
  adultPrice: number
  childPrice: number
  infantPrice: number
  maxCapacity: number
  category: {
    name: string
  }
  images: {
    id: number
    fileName: string
    filePath: string
    sortOrder: number
  }[]
}

interface MobileProductSliderProps {
  products: Product[]
  loading: boolean
  error: string
}

export default function MobileProductSlider({ products, loading, error }: MobileProductSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [currentX, setCurrentX] = useState(0)
  const sliderRef = useRef<HTMLDivElement>(null)

  const maxIndex = Math.max(0, products.length - 1)

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true)
    setStartX(e.touches[0].clientX)
    setCurrentX(e.touches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    setCurrentX(e.touches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!isDragging) return
    
    const diff = startX - currentX
    const threshold = 50

    if (Math.abs(diff) > threshold) {
      if (diff > 0 && currentIndex < maxIndex) {
        setCurrentIndex(currentIndex + 1)
      } else if (diff < 0 && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1)
      }
    }
    
    setIsDragging(false)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setStartX(e.clientX)
    setCurrentX(e.clientX)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    setCurrentX(e.clientX)
  }

  const handleMouseUp = () => {
    if (!isDragging) return
    
    const diff = startX - currentX
    const threshold = 50

    if (Math.abs(diff) > threshold) {
      if (diff > 0 && currentIndex < maxIndex) {
        setCurrentIndex(currentIndex + 1)
      } else if (diff < 0 && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1)
      }
    }
    
    setIsDragging(false)
  }

  const handleMouseLeave = () => {
    setIsDragging(false)
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-design-blue" />
        <p className="mt-4 text-design-gray-light font-pretendard text-lg">상품을 불러오는 중...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-[10px] text-center font-pretendard">
        {error}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <p className="text-design-gray-light font-pretendard text-lg">등록된 상품이 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="relative w-full">
      {/* 상품 슬라이더 */}
      <div 
        ref={sliderRef}
        className="flex transition-transform duration-300 ease-out cursor-grab active:cursor-grabbing"
        style={{ 
          transform: `translateX(-${currentIndex * 100}%)`,
          touchAction: 'pan-y'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        {products.map((product) => {
          const imagePath = product.images && product.images.length > 0 
            ? product.images[0].filePath 
            : "/images/395ecb514347a2b67636818efc42e5bc27269325.png"

          return (
            <div key={product.id} className="w-full flex-shrink-0 px-4">
              <Link 
                href={`/products/${product.id}`}
                className="block hover:transform hover:scale-105 transition-all duration-200 cursor-pointer border border-[#dddddd] rounded-[10px] overflow-hidden"
              >
                <div className="h-[347px] relative rounded-tl-[10px] rounded-tr-[10px]">
                  <img 
                    src={imagePath} 
                    alt={product.name}
                    className="w-full h-full object-cover rounded-tl-[10px] rounded-tr-[10px]"
                  />
                </div>
                <div className="h-[211px] relative rounded-bl-[10px] rounded-br-[10px] bg-white">
                  <div className="flex flex-col items-center h-full">
                    <div className="box-border flex flex-col h-[211px] items-center justify-between px-[20px] py-[16px] w-full">
                      <div className="flex flex-col gap-[4px] items-center text-center">
                        <div className="font-['Pretendard:Bold',_sans-serif] text-[#222222] text-[18px]">
                          <p className="leading-[26px] text-nowrap whitespace-pre">{product.name}</p>
                        </div>
                        <div className="font-['Pretendard:Regular',_sans-serif] leading-[19px] text-[#444444] text-[11px] whitespace-pre">
                          <p className="mb-0">{product.description || "상품 설명이 없습니다."}</p>
                        </div>
                      </div>
                      <div className="flex gap-[10px] items-center justify-center text-center">
                        <div className="font-['Pretendard:Regular',_sans-serif] text-[#666666] text-[11px]">
                          <p className="line-through leading-[20px] text-nowrap whitespace-pre">
                            {product.basePrice.toLocaleString()}원
                          </p>
                        </div>
                        <div className="font-['Pretendard:Bold',_sans-serif] text-[#222222] text-[18px]">
                          <p className="leading-[26px] text-nowrap whitespace-pre">
                            {product.adultPrice.toLocaleString()}원
                          </p>
                        </div>
                      </div>
                      <div className="bg-white flex gap-[4px] items-center justify-center px-0 py-[8px] rounded-[4px] w-full hover:bg-[#222222] transition-colors duration-200 group">
                        <div className="absolute border border-[#222222] border-solid inset-0 pointer-events-none rounded-[4px]" />
                        <div className="font-['Pretendard:SemiBold',_sans-serif] text-[#222222] group-hover:text-white text-[11px] text-center transition-colors duration-200">
                          <p className="leading-[20px] whitespace-pre">예약하기</p>
                        </div>
                        <div className="flex h-[12px] items-center justify-center w-[12px]">
                          <div className="flex-none rotate-[90deg]">
                            <div className="relative size-[12px]">
                              <svg className="block size-full" fill="none" viewBox="0 0 12 12">
                                <g>
                                  <path 
                                    d="M5 15l7-7 7 7" 
                                    stroke="#222222" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth="1.5" 
                                    className="group-hover:stroke-white transition-colors duration-200"
                                  />
                                </g>
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          )
        })}
      </div>

      {/* 인디케이터 */}
      {products.length > 1 && (
        <div className="flex justify-center mt-4 gap-2">
          {products.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                index === currentIndex ? 'bg-[#4C9DE8]' : 'bg-gray-300'
              }`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

