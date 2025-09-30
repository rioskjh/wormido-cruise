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
          <Image
            src="/images/ship-icon.png"
            alt="유람선 아이콘"
            width={66}
            height={33}
            className="w-full h-full object-contain"
          />
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
        <>
          {/* 모바일 버전 - 가로 스크롤 */}
          <div className="md:hidden w-full overflow-x-auto horizontal-scroll">
            <div className="flex gap-[20px] items-start pb-4" style={{ width: 'max-content' }}>
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
                    className="flex flex-col items-center relative shrink-0 w-[270px] hover:transform hover:scale-105 transition-all duration-200 cursor-pointer border border-[#dddddd] rounded-[10px] overflow-hidden"
                  >
                    {/* 상품 이미지 영역 */}
                    <div className="h-[284px] relative rounded-tl-[10px] rounded-tr-[10px] shrink-0 w-[270px]">
                      <Image
                        src={imageSrc}
                        alt={product.name}
                        fill
                        className="object-cover rounded-tl-[10px] rounded-tr-[10px]"
                      />
                    </div>
                  
                    {/* 상품 정보 영역 */}
                    <div className="h-[211px] relative rounded-bl-[10px] rounded-br-[10px] shrink-0 w-full">
                      <div aria-hidden="true" className="absolute border border-[#dddddd] border-solid inset-0 pointer-events-none rounded-bl-[10px] rounded-br-[10px]" />
                      <div className="flex flex-col items-center size-full">
                        <div className="box-border content-stretch flex flex-col h-[211px] items-center justify-between px-[20px] py-[16px] relative w-full">
                          {/* 상품 제목과 설명 */}
                          <div className="content-stretch flex flex-col gap-[4px] items-center leading-[0] not-italic relative shrink-0 text-center text-nowrap">
                            <div className="font-['Pretendard:Bold',_sans-serif] relative shrink-0 text-[#222222] text-[18px]">
                              <p className="leading-[26px] text-nowrap whitespace-pre">{product.name}</p>
                            </div>
                            <div className="font-['Pretendard:Regular',_sans-serif] leading-[19px] relative shrink-0 text-[#444444] text-[11px] whitespace-pre">
                              <p className="mb-0">{product.description || '상품 설명이 없습니다.'}</p>
                            </div>
                          </div>
                          
                          {/* 가격 정보 */}
                          <div className="content-stretch flex gap-[10px] items-center justify-center leading-[0] not-italic relative shrink-0 text-nowrap">
                            <div className="font-['Pretendard:Regular',_sans-serif] relative shrink-0 text-[#666666] text-[11px]">
                              <p className="[text-decoration-skip-ink:none] [text-underline-position:from-font] decoration-solid leading-[20px] line-through text-nowrap whitespace-pre">
                                {product.basePrice.toLocaleString()}원
                              </p>
                            </div>
                            <div className="font-['Pretendard:Bold',_sans-serif] relative shrink-0 text-[#222222] text-[18px]">
                              <p className="leading-[26px] text-nowrap whitespace-pre">
                                {product.adultPrice.toLocaleString()}원
                              </p>
                            </div>
                          </div>
                          
                          {/* 예약 버튼 */}
                          <div className="bg-white box-border content-stretch flex gap-[4px] items-center justify-center px-0 py-[8px] relative rounded-[4px] shrink-0 w-full hover:bg-[#222222] transition-colors duration-200 group">
                            <div aria-hidden="true" className="absolute border border-[#222222] border-solid inset-0 pointer-events-none rounded-[4px]" />
                            <div className="font-['Pretendard:SemiBold',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#222222] group-hover:text-white text-[11px] text-center text-nowrap transition-colors duration-200">
                              <p className="leading-[20px] whitespace-pre">예약하기</p>
                            </div>
                            <div className="flex h-[12px] items-center justify-center relative shrink-0 w-[12px]">
                              <div className="flex-none rotate-[90deg]">
                                <div className="relative size-[12px]">
                                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
                                    <g>
                                      <path d="M5 15l7-7 7 7" stroke="#222222" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" className="group-hover:stroke-white transition-colors duration-200" />
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
          </div>

          {/* 데스크톱 버전 */}
          <div className="hidden md:flex content-stretch gap-[30px] items-start relative shrink-0">
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
        </>
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
