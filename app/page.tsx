'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import UserNavigation from '@/components/UserNavigation'
import Footer from '@/components/Footer'

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
              <div className="hidden md:block [grid-area:1_/_1] h-[703px] ml-[260px] mt-0 w-[1250px] rounded-lg overflow-hidden">
                <Image
                  src="/images/91582b55f45f475993db95e57fe119b1b197944f.png"
                  alt="월미도 크루즈"
                  width={1250}
                  height={703}
                  className="w-full h-full object-cover"
                  priority
                />
              </div>
              
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
            {products.map((product, index) => {
              // 업로드된 이미지가 있으면 사용, 없으면 기본 이미지 사용
              const hasUploadedImage = product.images && product.images.length > 0
              const imageSrc = hasUploadedImage 
                ? product.images[0].filePath 
                : `/images/0279006e5653701283e6e34a07b609333312b52a.png`
              
              return (
                <div key={product.id} className="bg-white rounded-[10px] shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                  {/* 상품 이미지 영역 */}
                  <div className="h-[200px] relative">
                    <Image
                      src={imageSrc}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
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

      {/* 배너 섹션 */}
      <section className="w-full py-16 relative overflow-hidden">
        {/* 배경 이미지 */}
        <div className="absolute inset-0">
          <Image
            src="/images/554419256e070f67b901bd627c66e2442e2f9b89.png"
            alt="배너 배경"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-pretendard">
              특별한 크루즈 경험을 시작하세요
            </h2>
            <p className="text-lg md:text-xl mb-6 font-pretendard opacity-90">
              월미도의 아름다운 바다와 함께하는 잊지 못할 추억을 만들어보세요
            </p>
            
            {/* 단체여행 안내 */}
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-6 mb-8 max-w-2xl mx-auto">
              <h3 className="text-xl md:text-2xl font-bold mb-2 font-pretendard">
                단체여행은 맞춤형 패키지로 편리하게
              </h3>
              <p className="text-sm md:text-base opacity-90 font-pretendard">
                기업 연수, 가족 모임, 친구 모임 등 다양한 단체 여행을 위한 특별한 패키지를 제공합니다
              </p>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="font-pretendard text-lg">매일 운항</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="font-pretendard text-lg">안전한 운항</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <span className="font-pretendard text-lg">최고의 서비스</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 공지사항 및 고객센터 섹션 */}
      <section className="w-full py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 공지사항 */}
            <div className="bg-white rounded-[10px] shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-design-blue rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-design-gray font-pretendard">공지사항</h3>
              </div>
              <div className="space-y-4">
                <div className="border-l-4 border-design-blue pl-4 py-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-design-gray font-pretendard text-sm">겨울 시즌 운항 안내</h4>
                      <p className="text-design-gray-light font-pretendard text-xs mt-1">2024.12.01</p>
                    </div>
                    <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full font-pretendard">중요</span>
                  </div>
                </div>
                <div className="border-l-4 border-gray-200 pl-4 py-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-design-gray font-pretendard text-sm">신규 크루즈 코스 오픈</h4>
                      <p className="text-design-gray-light font-pretendard text-xs mt-1">2024.11.25</p>
                    </div>
                  </div>
                </div>
                <div className="border-l-4 border-gray-200 pl-4 py-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-design-gray font-pretendard text-sm">예약 시스템 점검 안내</h4>
                      <p className="text-design-gray-light font-pretendard text-xs mt-1">2024.11.20</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 text-center">
                <Link href="/notice" className="text-design-blue hover:text-blue-600 font-pretendard text-sm font-medium">
                  더보기 →
                </Link>
              </div>
            </div>

            {/* 고객센터 */}
            <div className="bg-white rounded-[10px] shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-design-purple rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-design-gray font-pretendard">도와드릴까요?</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 bg-design-blue rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-design-gray font-pretendard">전화 문의</h4>
                    <p className="text-design-gray-light font-pretendard text-sm">032-123-4567</p>
                    <p className="text-design-gray-light font-pretendard text-xs">평일 09:00 - 18:00</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 bg-design-purple rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-design-gray font-pretendard">카카오톡 상담</h4>
                    <p className="text-design-gray-light font-pretendard text-sm">@월미도크루즈</p>
                    <p className="text-design-gray-light font-pretendard text-xs">24시간 자동응답</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-design-gray font-pretendard">이메일 문의</h4>
                    <p className="text-design-gray-light font-pretendard text-sm">info@wormicruise.com</p>
                    <p className="text-design-gray-light font-pretendard text-xs">24시간 접수</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 text-center">
                <Link href="/support" className="text-design-blue hover:text-blue-600 font-pretendard text-sm font-medium">
                  자주 묻는 질문 →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  )
}
