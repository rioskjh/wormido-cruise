'use client'

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

interface TabletProductGridProps {
  products: Product[]
  loading: boolean
  error: string
}

export default function TabletProductGrid({ products, loading, error }: TabletProductGridProps) {
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
    <div className="grid grid-cols-3 gap-6">
      {products.slice(0, 3).map((product) => {
        const imagePath = product.images && product.images.length > 0 
          ? product.images[0].filePath 
          : "/images/395ecb514347a2b67636818efc42e5bc27269325.png"

        return (
          <Link 
            key={product.id}
            href={`/products/${product.id}`}
            className="block hover:transform hover:scale-105 transition-all duration-200 cursor-pointer border border-[#dddddd] rounded-[10px] overflow-hidden"
          >
            <div className="h-[280px] relative rounded-tl-[10px] rounded-tr-[10px]">
              <img 
                src={imagePath} 
                alt={product.name}
                className="w-full h-full object-cover rounded-tl-[10px] rounded-tr-[10px]"
              />
            </div>
            <div className="relative rounded-bl-[10px] rounded-br-[10px] bg-white">
              <div className="flex flex-col items-center h-full">
                <div className="box-border flex flex-col gap-4 items-center px-5 py-6 w-full">
                  <div className="flex flex-col gap-2 items-center text-center">
                    <div className="font-['Pretendard:Bold',_sans-serif] text-[#222222] text-[20px]">
                      <p className="leading-[28px] text-nowrap whitespace-pre">{product.name}</p>
                    </div>
                    <div className="font-['Pretendard:Regular',_sans-serif] leading-[22px] text-[#444444] text-[13px] whitespace-pre">
                      <p className="mb-0">{product.description || "상품 설명이 없습니다."}</p>
                    </div>
                  </div>
                  <div className="flex gap-3 items-center justify-center text-center">
                    <div className="font-['Pretendard:Regular',_sans-serif] text-[#666666] text-[13px]">
                      <p className="line-through leading-[22px] text-nowrap whitespace-pre">
                        {product.basePrice.toLocaleString()}원
                      </p>
                    </div>
                    <div className="font-['Pretendard:Bold',_sans-serif] text-[#222222] text-[20px]">
                      <p className="leading-[28px] text-nowrap whitespace-pre">
                        {product.adultPrice.toLocaleString()}원
                      </p>
                    </div>
                  </div>
                  <div className="bg-white flex gap-2 items-center justify-center px-0 py-3 rounded-[4px] w-full hover:bg-[#222222] transition-colors duration-200 group">
                    <div className="absolute border border-[#222222] border-solid inset-0 pointer-events-none rounded-[4px]" />
                    <div className="font-['Pretendard:SemiBold',_sans-serif] text-[#222222] group-hover:text-white text-[13px] text-center transition-colors duration-200">
                      <p className="leading-[22px] whitespace-pre">예약하기</p>
                    </div>
                    <div className="flex h-[16px] items-center justify-center w-[16px]">
                      <div className="flex-none rotate-[90deg]">
                        <div className="relative size-[16px]">
                          <svg className="block size-full" fill="none" viewBox="0 0 16 16">
                            <g>
                              <path 
                                d="M6 20l9-9 9 9" 
                                stroke="#222222" 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth="2" 
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
        )
      })}
    </div>
  )
}

