'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import UserNavigation from '@/components/UserNavigation'

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
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
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

  return (
    <main className="min-h-screen bg-white">
      {/* 네비게이션 */}
      <UserNavigation />

      {/* 메인 비주얼 섹션 */}
      <section className="h-[400px] md:h-[703px] relative w-full">
        <div className="flex flex-row items-center relative size-full">
          <div className="box-border content-stretch flex h-[400px] md:h-[703px] items-center justify-between px-4 md:pl-[360px] md:pr-[50px] py-0 relative w-full">
            {/* 배경 */}
            <div className="absolute bg-design-purple h-[300px] md:h-[450px] left-0 top-[50px] md:top-[127px] w-full" />
            
            {/* 메인 콘텐츠 */}
            <div className="relative w-full flex flex-col md:grid md:grid-cols-[max-content] md:grid-rows-[max-content] md:inline-grid leading-[0] place-items-start shrink-0">
              {/* 크루즈 이미지 - 모바일에서는 숨김 */}
              <div className="hidden md:block [grid-area:1_/_1] bg-[position:0%_0%,_50%_50%] bg-size-[auto,cover] h-[703px] ml-[260px] mt-0 w-[1250px] bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg" />
              
              {/* 텍스트 오버레이 */}
              <div className="[grid-area:1_/_1] box-border content-stretch flex flex-col gap-8 md:gap-[150px] items-center md:items-start justify-center ml-0 mt-0 md:mt-[220.5px] relative px-4 md:px-0">
                <div className="content-stretch flex flex-col gap-6 md:gap-[30px] h-auto md:h-[262px] items-center md:items-start justify-start relative shrink-0 w-full md:w-[427.534px] text-center md:text-left">
                  {/* 메인 타이틀 */}
                  <div className="box-border content-stretch flex gap-[10px] items-center justify-center pl-0 pr-[20px] py-[10px] relative shrink-0">
                    <div className="font-pretendard leading-[40px] md:leading-[76px] not-italic relative shrink-0 text-[32px] md:text-[56px] text-nowrap text-white whitespace-pre">
                      <p className="mb-0">푸른 바다 위에서</p>
                      <p>만나는 특별한 하루</p>
                    </div>
                  </div>
                  
                  {/* 서브 타이틀 */}
                  <div className="box-border content-stretch flex gap-[10px] items-center justify-center pl-0 pr-[20px] py-[10px] relative shrink-0">
                    <div className="font-pretendard leading-[0] not-italic relative shrink-0 text-[16px] md:text-[20px] text-nowrap text-white">
                      <p className="leading-[24px] md:leading-[32px] whitespace-pre">월미도 해양관광 크루즈와 함께하는 잊지 못할 여행</p>
                    </div>
                  </div>
                  
                  {/* CTA 버튼 */}
                  <div className="content-stretch flex flex-col md:flex-row gap-4 md:gap-[40px] items-center justify-start relative shrink-0 mt-4 md:mt-8">
                    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
                      <div className="[grid-area:1_/_1] grid-cols-[max-content] grid-rows-[max-content] inline-grid ml-[5.208%] mt-[11.458%] place-items-start relative">
                        <div className="w-12 h-12 bg-design-blue rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="content-stretch flex flex-col gap-[4px] items-center md:items-start justify-start leading-[0] not-italic relative shrink-0 text-nowrap text-center md:text-left">
                      <div className="font-pretendard relative shrink-0 text-white md:text-design-gray text-[20px] md:text-[24px]">
                        <p className="leading-[28px] md:leading-[34px] text-nowrap whitespace-pre">승선권 예매하기</p>
                      </div>
                      <div className="font-pretendard relative shrink-0 text-white md:text-design-gray-light text-[14px] md:text-[17px]">
                        <p className="leading-[20px] md:leading-[28px] text-nowrap whitespace-pre">원하는 일정과 좌석을 간편하게 선택</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 메인 콘텐츠 */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-design-gray mb-4 font-pretendard">
            아름다운 월미도 바다를 즐기는 크루즈 투어
          </h2>
          <p className="text-lg text-design-gray-light font-pretendard">
            특별한 추억을 만들어보세요
          </p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-[10px] shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                {/* 상품 이미지 영역 */}
                <div className="h-[200px] bg-gradient-to-br from-blue-400 to-blue-600 relative">
                  <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                  <div className="absolute top-4 left-4">
                    <span className="bg-design-purple text-white text-xs font-medium px-3 py-1 rounded-full font-pretendard">
                      {product.category.name}
                    </span>
                  </div>
                  <div className="absolute bottom-4 right-4">
                    <span className="bg-white bg-opacity-90 text-design-gray text-xs font-medium px-2 py-1 rounded font-pretendard">
                      최대 {product.maxCapacity}명
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-design-gray mb-3 font-pretendard">
                    {product.name}
                  </h3>
                  
                  <p className="text-design-gray-light mb-6 line-clamp-2 font-pretendard text-sm leading-relaxed">
                    {product.description}
                  </p>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-design-gray font-pretendard text-sm">성인</span>
                      <span className="font-semibold text-design-gray font-pretendard">{product.adultPrice.toLocaleString()}원</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-design-gray font-pretendard text-sm">어린이</span>
                      <span className="font-semibold text-design-gray font-pretendard">{product.childPrice.toLocaleString()}원</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-design-gray font-pretendard text-sm">유아</span>
                      <span className="font-semibold text-design-gray font-pretendard">{product.infantPrice.toLocaleString()}원</span>
                    </div>
                  </div>
                  
                  <Link 
                    href={`/products/${product.id}`}
                    className="block w-full bg-design-blue text-white py-3 px-4 rounded-[10px] hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-design-blue focus:ring-offset-2 text-center font-pretendard font-medium transition-colors duration-200"
                  >
                    예약하기
                  </Link>
                </div>
              </div>
            ))}
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
    </main>
  )
}
