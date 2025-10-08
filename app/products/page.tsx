'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import UserNavigation from '@/components/UserNavigation'
import Footer from '@/components/Footer'
import SubNavigation from '@/components/SubNavigation'

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
    id: number
    name: string
  }
  images: {
    id: number
    fileName: string
    filePath: string
    sortOrder: number
  }[]
}

interface Category {
  id: number
  name: string
  sortOrder: number
}

// 디자인 파일의 SVG 아이콘들
function ArrowUpIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
    </svg>
  )
}

function ProductsContent() {
  const searchParams = useSearchParams()
  const categoryId = searchParams.get('category')
  
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    if (categories.length > 0) {
      if (categoryId) {
        const category = categories.find(cat => cat.id.toString() === categoryId)
        if (category) {
          setSelectedCategory(category)
          fetchProducts(category.id)
        } else {
          setError('존재하지 않는 카테고리입니다.')
          setLoading(false)
        }
      } else {
        // 카테고리가 선택되지 않은 경우 첫 번째 카테고리로 설정
        setSelectedCategory(categories[0])
        fetchProducts(categories[0].id)
      }
    }
  }, [categories, categoryId])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const data = await response.json()
      
      if (data.ok) {
        setCategories(data.data)
      } else {
        setError('카테고리를 불러오는 중 오류가 발생했습니다.')
      }
    } catch (error) {
      setError('서버 오류가 발생했습니다.')
    }
  }

  const fetchProducts = async (categoryId: number) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/products?category=${categoryId}`)
      const data = await response.json()
      
      if (data.ok) {
        setProducts(data.data.products)
      } else {
        setError('상품을 불러오는 중 오류가 발생했습니다.')
      }
    } catch (error) {
      setError('서버 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryChange = (category: Category) => {
    setSelectedCategory(category)
    fetchProducts(category.id)
    // URL 업데이트
    const url = new URL(window.location.href)
    url.searchParams.set('category', category.id.toString())
    window.history.pushState({}, '', url.toString())
  }

  return (
    <div className="bg-white min-h-screen">
      {/* 헤더 */}
      <UserNavigation />
      
      {/* 비주얼 섹션 */}
      <div className="relative w-full h-[370px] flex items-center justify-center overflow-hidden rounded-[10px] mx-auto max-w-[1820px]">
        <div className="absolute inset-0">
          <img 
            alt="상품예약 배너" 
            className="w-full h-full object-cover rounded-[10px]" 
            src="/images/design-assets/aeefcb7185f8ec781f75ece941d96ec57ad9dad5.png" 
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 rounded-[10px]" />
        </div>
        <h1 className="relative z-10 text-white text-[50px] font-bold font-['Pretendard:Bold'] leading-[60px]">
          상품예약
        </h1>
      </div>

      {/* 서브 네비게이션 */}
      <SubNavigation 
        items={[
          { 
            label: '상품예약',
            href: '/products'
          },
          { 
            label: selectedCategory?.name || '전체'
          }
        ]}
      />

      {/* 메인 콘텐츠 */}
      <div className="flex flex-col items-center px-0 py-[100px] w-[1200px] mx-auto">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#222222]"></div>
            <p className="mt-4 text-[#666666] font-['Pretendard'] text-lg">상품을 불러오는 중...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg text-center font-['Pretendard']">
            {error}
          </div>
        ) : (
          <div className="flex gap-[30px] items-start">
            {products.slice(0, 3).map((product, index) => {
              // 업로드된 이미지가 있으면 사용, 없으면 기본 이미지 사용
              const hasUploadedImage = product.images && product.images.length > 0
              const imageSrc = hasUploadedImage 
                ? product.images[0].filePath 
                : `/images/design-assets/${index === 0 ? '395ecb514347a2b67636818efc42e5bc27269325.png' : index === 1 ? '17c94b934fb469c9e8305d4e810a5c1b2eda98b4.png' : 'ec35f3ef156b9a8f70f3287075f9d663e753a88b.png'}`
              
              return (
                <Link 
                  key={product.id} 
                  href={`/products/${product.id}`}
                  className="flex flex-col items-center w-[380px] group"
                >
                  {/* 상품 이미지 */}
                  <div className="h-[350px] w-[380px] rounded-tl-[10px] rounded-tr-[10px] overflow-hidden">
                    <img
                      src={imageSrc}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* 상품 정보 */}
                  <div className="relative rounded-bl-[10px] rounded-br-[10px] w-full border border-[#dddddd]">
                    <div className="flex flex-col items-center px-[20px] py-[30px] gap-[30px]">
                      {/* 상품 제목 및 설명 */}
                      <div className="flex flex-col gap-[10px] items-center text-center">
                        <h3 className="text-[#222222] text-[26px] font-bold font-['Pretendard:Bold'] leading-[36px]">
                          {product.name}
                        </h3>
                        <div className="text-[#444444] text-[18px] font-['Pretendard:Regular'] leading-[30px]">
                          <p className="mb-0">{product.description || '상품 설명이 없습니다.'}</p>
                        </div>
                      </div>

                      {/* 가격 정보 */}
                      <div className="flex gap-[10px] items-center justify-center">
                        {product.basePrice > product.adultPrice ? (
                          <>
                            <p className="line-through text-[#666666] text-[17px] font-['Pretendard:Regular'] leading-[28px]">
                              {product.basePrice.toLocaleString()}원
                            </p>
                            <p className="text-[#222222] text-[24px] font-bold font-['Pretendard:Bold'] leading-[34px]">
                              {product.adultPrice.toLocaleString()}원
                            </p>
                          </>
                        ) : (
                          <p className="text-[#222222] text-[24px] font-bold font-['Pretendard:Bold'] leading-[34px]">
                            {product.adultPrice.toLocaleString()}원
                          </p>
                        )}
                      </div>

                      {/* 예약 버튼 */}
                      <div className="bg-white border border-[#222222] rounded-[4px] w-full">
                        <div className="flex gap-[10px] items-center justify-center px-0 py-[10px]">
                          <p className="text-[#222222] text-[17px] font-semibold font-['Pretendard:SemiBold'] leading-[30px] text-center">
                            예약하기
                          </p>
                          <div className="flex h-[20px] items-center justify-center w-[20px]">
                            <div className="rotate-90">
                              <ArrowUpIcon />
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

        {/* 상품이 없는 경우 */}
        {!loading && !error && products.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <p className="text-[#666666] font-['Pretendard'] text-lg">
              {selectedCategory?.name} 카테고리에 등록된 상품이 없습니다.
            </p>
          </div>
        )}
      </div>
      
      {/* 푸터 */}
      <Footer />

      {/* 퀵 메뉴 */}
      <div className="fixed bottom-[422px] right-[30px] w-[110px] h-[493px] z-50">
        {/* 고려고속훼리 배너 */}
        <div className="absolute bottom-[48.08%] left-0 right-0 top-0 bg-white border border-[#dddddd] rounded-[4px]">
          <div className="absolute top-[16px] left-1/2 transform -translate-x-1/2 w-[90px] h-[54px]">
            <img 
              alt="고려고속훼리" 
              className="w-full h-full object-cover" 
              src="/images/design-assets/7e657e35e06dc5205bd4b4fc008cd681ce75869e.png" 
            />
          </div>
          <div className="absolute bg-[#4c9de8] bottom-0 left-0 right-0 top-[27.09%] flex items-center justify-center">
            <div className="flex flex-col gap-[4px] items-center">
              <p className="text-white text-[15px] font-bold font-['Pretendard:Bold'] leading-[26px] text-center tracking-[-0.75px]">
                고려고속훼리(주)
              </p>
              <div className="bg-white rounded-[4px] px-[10px] py-0">
                <p className="text-[#4c9de8] text-[15px] font-bold font-['Pretendard:Bold'] leading-[26px] text-center tracking-[-0.75px]">
                  바로가기
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 퀵 버튼들 */}
        <div className="absolute bottom-0 left-[22.73%] right-[22.73%] top-[54.85%] flex flex-col gap-[10px] items-start">
          {/* 카카오톡 버튼 */}
          <div className="relative w-[60px] h-[60px]">
            <div className="absolute inset-[-6.67%_-16.67%_-20%_-10%]">
              <svg className="w-full h-full" fill="none" viewBox="0 0 76 76">
                <g filter="url(#filter0_d_1_942)">
                  <circle cx="36" cy="34" fill="white" r="30" stroke="#DDDDDD" strokeWidth="1" />
                </g>
                <g>
                  <path d="M30 25h12v2H30v-2zm0 4h12v2H30v-2zm0 4h8v2h-8v-2z" fill="#222222" />
                </g>
                <defs>
                  <filter id="filter0_d_1_942" x="0" y="0" width="76" height="76">
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
                    <feOffset dx="2" dy="4" />
                    <feGaussianBlur stdDeviation="4" />
                    <feComposite in2="hardAlpha" operator="out" />
                    <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0" />
                    <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_1_942" />
                    <feBlend in="SourceGraphic" in2="effect1_dropShadow_1_942" mode="normal" result="shape" />
                  </filter>
                </defs>
              </svg>
            </div>
          </div>

          {/* 네이버 버튼 */}
          <div className="relative w-[60px] h-[60px]">
            <div className="absolute inset-[-6.67%_-16.67%_-20%_-10%]">
              <svg className="w-full h-full" fill="none" viewBox="0 0 76 76">
                <g filter="url(#filter0_d_1_972)">
                  <circle cx="36" cy="34" fill="white" r="30" stroke="#DDDDDD" strokeWidth="1" />
                </g>
                <g clipPath="url(#clip0_1_972)">
                  <path d="M27 25h18v18H27V25z" fill="black" />
                </g>
                <defs>
                  <filter id="filter0_d_1_972" x="0" y="0" width="76" height="76">
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
                    <feOffset dx="2" dy="4" />
                    <feGaussianBlur stdDeviation="4" />
                    <feComposite in2="hardAlpha" operator="out" />
                    <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0" />
                    <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_1_972" />
                    <feBlend in="SourceGraphic" in2="effect1_dropShadow_1_972" mode="normal" result="shape" />
                  </filter>
                  <clipPath id="clip0_1_972">
                    <rect fill="white" height="18" width="18" x="27" y="25" />
                  </clipPath>
                </defs>
              </svg>
            </div>
          </div>

          {/* 맨 위로 버튼 */}
          <div className="relative w-[60px] h-[60px]">
            <div className="absolute inset-[-6.67%_-16.67%_-20%_-10%]">
              <svg className="w-full h-full" fill="none" viewBox="0 0 76 76">
                <g filter="url(#filter0_d_1_937)">
                  <circle cx="36" cy="34" fill="white" r="30" stroke="#DDDDDD" strokeWidth="1" />
                </g>
                <g>
                  <path d="M30 30l6-6 6 6" stroke="black" strokeLinecap="square" strokeWidth="2" />
                </g>
                <defs>
                  <filter id="filter0_d_1_937" x="0" y="0" width="76" height="76">
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
                    <feOffset dx="2" dy="4" />
                    <feGaussianBlur stdDeviation="4" />
                    <feComposite in2="hardAlpha" operator="out" />
                    <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0" />
                    <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_1_937" />
                    <feBlend in="SourceGraphic" in2="effect1_dropShadow_1_937" mode="normal" result="shape" />
                  </filter>
                </defs>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProductsLoading() {
  return (
    <div className="bg-white min-h-screen">
      <UserNavigation />
      <div className="py-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#222222]"></div>
            <p className="mt-4 text-[#666666] font-['Pretendard'] text-lg">상품을 불러오는 중...</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsLoading />}>
      <ProductsContent />
    </Suspense>
  )
}