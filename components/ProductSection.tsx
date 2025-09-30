'use client'

import Link from 'next/link'
import Image from 'next/image'

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

interface ProductSectionProps {
  products: Product[]
  loading: boolean
  error: string
}

export default function ProductSection({ products, loading, error }: ProductSectionProps) {
  return (
    <div className="box-border content-stretch flex flex-col gap-[30px] items-start pb-[100px] pt-0 px-0 relative size-full">
      {/* 상품소개 제목 */}
      <div className="content-stretch flex gap-[16px] items-center relative shrink-0">
        {/* 상품소개 아이콘 - 유람선 */}
        <div className="h-[33px] relative shrink-0 w-[66px] flex items-center justify-center">
          <svg className="w-full h-full" viewBox="0 0 66 33" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* 유람선 선체 (하단) */}
            <path d="M8 25C8 25 12 28 20 28C28 28 32 25 32 25L35 22C35 22 31 25 20 25C9 25 5 22 5 22L8 25Z" fill="#2D68FF" />
            {/* 유람선 선체 (상단) */}
            <path d="M5 22C5 22 9 20 20 20C31 20 35 22 35 22L32 19C32 19 28 17 20 17C12 17 8 19 8 19L5 22Z" fill="#4A90E2" />
            {/* 유람선 상부 구조물 */}
            <rect x="12" y="12" width="16" height="8" rx="1" fill="white" />
            <rect x="14" y="14" width="12" height="6" rx="0.5" fill="#E8F4FD" />
            {/* 유람선 상부 구조물 (2층) */}
            <rect x="16" y="8" width="8" height="6" rx="1" fill="white" />
            <rect x="17" y="9" width="6" height="4" rx="0.5" fill="#E8F4FD" />
            {/* 유람선 상부 구조물 (3층) */}
            <rect x="18" y="4" width="4" height="6" rx="1" fill="white" />
            <rect x="18.5" y="5" width="3" height="4" rx="0.5" fill="#E8F4FD" />
            {/* 창문들 */}
            <rect x="15" y="15" width="1.5" height="1.5" fill="#2D68FF" />
            <rect x="17.5" y="15" width="1.5" height="1.5" fill="#2D68FF" />
            <rect x="20" y="15" width="1.5" height="1.5" fill="#2D68FF" />
            <rect x="22.5" y="15" width="1.5" height="1.5" fill="#2D68FF" />
            <rect x="25" y="15" width="1.5" height="1.5" fill="#2D68FF" />
            <rect x="27.5" y="15" width="1.5" height="1.5" fill="#2D68FF" />
            {/* 2층 창문들 */}
            <rect x="17.5" y="10" width="1" height="1" fill="#2D68FF" />
            <rect x="19" y="10" width="1" height="1" fill="#2D68FF" />
            <rect x="20.5" y="10" width="1" height="1" fill="#2D68FF" />
            <rect x="22" y="10" width="1" height="1" fill="#2D68FF" />
            {/* 3층 창문들 */}
            <rect x="19" y="6" width="0.8" height="0.8" fill="#2D68FF" />
            <rect x="20.2" y="6" width="0.8" height="0.8" fill="#2D68FF" />
            <rect x="21.4" y="6" width="0.8" height="0.8" fill="#2D68FF" />
          </svg>
        </div>
        <div className="font-['Pretendard:Bold',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#222222] text-[34px] text-nowrap">
          <p className="leading-[50px] whitespace-pre">상품소개</p>
        </div>
      </div>

      {/* 상품 목록 */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-design-blue"></div>
          <p className="mt-4 text-design-gray-light font-pretendard text-lg">상품을 불러오는 중...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-[10px] text-center font-pretendard">
          {error}
        </div>
      ) : (
        <div className="content-stretch flex gap-[30px] items-start relative shrink-0">
          {products.map((product, index) => {
            // 업로드된 이미지가 있으면 사용, 없으면 기본 이미지 사용
            const hasUploadedImage = product.images && product.images.length > 0
            const imageSrc = hasUploadedImage 
              ? product.images[0].filePath 
              : `/images/395ecb514347a2b67636818efc42e5bc27269325.png`
            
            return (
              <Link 
                key={product.id} 
                href={`/products/${product.id}`}
                className="content-stretch flex flex-col items-center relative shrink-0 w-[380px] hover:transform hover:scale-105 transition-all duration-200 cursor-pointer border border-[#dddddd] rounded-[10px] overflow-hidden"
              >
                {/* 상품 이미지 영역 */}
                <div className="h-[350px] relative rounded-tl-[10px] rounded-tr-[10px] shrink-0 w-[380px]">
                  <Image
                    src={imageSrc}
                    alt={product.name}
                    fill
                    className="object-cover rounded-tl-[10px] rounded-tr-[10px]"
                  />
                </div>
              
                {/* 상품 정보 영역 */}
                <div className="relative rounded-bl-[10px] rounded-br-[10px] shrink-0 w-full">
                  <div className="flex flex-col items-center size-full">
                    <div className="box-border content-stretch flex flex-col gap-[30px] items-center px-[20px] py-[30px] relative w-full">
                      {/* 상품 제목과 설명 */}
                      <div className="content-stretch flex flex-col gap-[10px] items-center leading-[0] not-italic relative shrink-0 text-center text-nowrap">
                        <div className="font-['Pretendard:Bold',_sans-serif] relative shrink-0 text-[#222222] text-[26px]">
                          <p className="leading-[36px] text-nowrap whitespace-pre">{product.name}</p>
                        </div>
                        <div className="font-['Pretendard:Regular',_sans-serif] leading-[30px] relative shrink-0 text-[#444444] text-[18px] whitespace-pre">
                          <p className="mb-0">{product.description || '상품 설명이 없습니다.'}</p>
                        </div>
                      </div>
                      
                      {/* 가격 정보 */}
                      <div className="content-stretch flex gap-[10px] items-center justify-center leading-[0] not-italic relative shrink-0 text-nowrap">
                        <div className="font-['Pretendard:Regular',_sans-serif] relative shrink-0 text-[#666666] text-[17px]">
                          <p className="[text-decoration-skip-ink:none] [text-underline-position:from-font] decoration-solid leading-[28px] line-through text-nowrap whitespace-pre">
                            {product.basePrice.toLocaleString()}원
                          </p>
                        </div>
                        <div className="font-['Pretendard:Bold',_sans-serif] relative shrink-0 text-[#222222] text-[24px]">
                          <p className="leading-[34px] text-nowrap whitespace-pre">
                            {product.adultPrice.toLocaleString()}원
                          </p>
                        </div>
                      </div>
                      
                      {/* 예약 버튼 */}
                      <div className="bg-white box-border content-stretch flex gap-[10px] items-center justify-center px-0 py-[10px] relative rounded-[4px] shrink-0 w-full hover:bg-[#222222] transition-colors duration-200 group">
                        <div aria-hidden="true" className="absolute border border-[#222222] border-solid inset-0 pointer-events-none rounded-[4px]" />
                        <div className="font-['Pretendard:SemiBold',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#222222] group-hover:text-white text-[17px] text-center text-nowrap transition-colors duration-200">
                          <p className="leading-[30px] whitespace-pre">예약하기</p>
                        </div>
                        <div className="flex h-[20px] items-center justify-center relative shrink-0 w-[20px]">
                          <div className="flex-none rotate-[90deg]">
                            <div className="relative size-[20px]">
                              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
                                <g>
                                  <path d="M5 15l7-7 7 7" stroke="#222222" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="group-hover:stroke-white transition-colors duration-200" />
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
      )}

      {products.length === 0 && !loading && !error && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <p className="text-design-gray-light font-pretendard text-lg">등록된 상품이 없습니다.</p>
        </div>
      )}
    </div>
  )
}
