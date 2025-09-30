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
                    <div className="font-pretendard leading-[40px] md:leading-[76px] not-italic relative shrink-0 text-[32px] md:text-[56px] text-nowrap text-white whitespace-pre font-medium" style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.7)' }}>
                      <p className="mb-0">푸른 바다 위에서</p>
                      <p>만나는 특별한 하루</p>
                    </div>
                  </div>
                  
                  {/* 서브 타이틀 */}
                  <div className="box-border content-stretch flex gap-[10px] items-center justify-center pl-0 pr-[20px] py-[10px] relative shrink-0">
                    <div className="font-pretendard leading-[0] not-italic relative shrink-0 text-[16px] md:text-[20px] text-nowrap text-white" style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.7)' }}>
                      <p className="leading-[24px] md:leading-[32px] whitespace-pre">월미도 해양관광 크루즈와 함께하는 잊지 못할 여행</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 예약 카드 섹션 */}
      <section className="w-full py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-8 items-center justify-center max-w-6xl mx-auto">
            {/* 승선권 예매하기 카드 */}
            <Link 
              href="/reservation" 
              className="group w-full md:w-[585px] bg-white rounded-[10px] border border-gray-300 hover:border-[#222222] transition-all duration-200 hover:shadow-lg"
            >
              <div className="flex items-center justify-between px-[50px] py-[30px]">
                <div className="flex gap-[40px] items-center">
                  {/* 아이콘 */}
                  <div className="w-[44px] h-[44px] bg-design-blue rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                    </svg>
                  </div>
                  
                  {/* 텍스트 */}
                  <div className="flex flex-col gap-1">
                    <h3 className="font-semibold text-[#222222] text-[24px] font-pretendard">
                      승선권 예매하기
                    </h3>
                    <p className="font-regular text-[#444444] text-[17px] font-pretendard">
                      원하는 일정과 좌석을 간편하게 선택
                    </p>
                  </div>
                </div>
                
                {/* 화살표 */}
                <div className="w-[36px] h-[36px] flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-400 group-hover:text-[#222222] transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>

            {/* 예약확인 및 취소 카드 */}
            <Link 
              href="/reservation/check" 
              className="group w-full md:w-[585px] bg-white rounded-[10px] border border-gray-300 hover:border-[#222222] transition-all duration-200 hover:shadow-lg"
            >
              <div className="flex items-center justify-between px-[50px] py-[30px]">
                <div className="flex gap-[40px] items-center">
                  {/* 아이콘 */}
                  <div className="w-[44px] h-[44px] bg-design-blue rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  
                  {/* 텍스트 */}
                  <div className="flex flex-col gap-1">
                    <h3 className="font-semibold text-[#222222] text-[24px] font-pretendard">
                      예약확인 및 취소
                    </h3>
                    <p className="font-regular text-[#444444] text-[17px] font-pretendard">
                      예약 내역을 한눈에 확인하세요.
                    </p>
                  </div>
                </div>
                
                {/* 화살표 */}
                <div className="w-[36px] h-[36px] flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-400 group-hover:text-[#222222] transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 상품소개 섹션 */}
      <section className="w-full py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-design-blue rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-design-gray font-pretendard">상품소개</h2>
            </div>
          </div>
        </div>
      </section>

      {/* 메인 콘텐츠 */}
      <div className="container mx-auto px-4 pb-8">

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
          <div className="flex flex-col md:flex-row md:flex-wrap gap-[30px] items-start justify-start md:justify-center">
            {products.map((product, index) => {
              // 업로드된 이미지가 있으면 사용, 없으면 기본 이미지 사용
              const hasUploadedImage = product.images && product.images.length > 0
              const imageSrc = hasUploadedImage 
                ? product.images[0].filePath 
                : `/images/0279006e5653701283e6e34a07b609333312b52a.png`
              
              return (
                <Link 
                  key={product.id} 
                  href={`/products/${product.id}`}
                  className="content-stretch flex flex-col items-center justify-start relative shrink-0 w-full md:w-[380px] hover:transform hover:scale-105 transition-all duration-200 cursor-pointer"
                >
                  {/* 상품 이미지 영역 */}
                  <div className="relative rounded-tl-[10px] rounded-tr-[10px] shrink-0 w-full h-[250px]">
                    <Image
                      src={imageSrc}
                      alt={product.name}
                      fill
                      className="object-cover rounded-tl-[10px] rounded-tr-[10px]"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-10 rounded-tl-[10px] rounded-tr-[10px]"></div>
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
                
                  {/* 상품 정보 영역 */}
                  <div className="relative rounded-bl-[10px] rounded-br-[10px] shrink-0 w-full h-[280px]">
                    <div className="absolute border border-[#dddddd] border-solid inset-0 pointer-events-none rounded-bl-[10px] rounded-br-[10px]"></div>
                    <div className="flex flex-col items-center relative size-full">
                      <div className="box-border content-stretch flex flex-col items-center justify-between px-[20px] py-[30px] relative w-full h-full">
                        {/* 상품 제목 */}
                        <div className="content-stretch flex flex-col gap-[10px] items-center justify-start relative shrink-0 w-full">
                          <div className="font-['Pretendard:Bold',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#222222] text-[20px] text-center">
                            <p className="leading-[30px] whitespace-pre">{product.name}</p>
                          </div>
                          <div className="font-['Pretendard:Regular',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#666666] text-[14px] text-center h-[44px] flex items-center justify-center">
                            <p className="leading-[22px] line-clamp-2">{product.description || '상품 설명이 없습니다.'}</p>
                          </div>
                        </div>
                        
                        {/* 가격 정보 */}
                        <div className="content-stretch flex flex-col gap-[15px] items-center justify-start relative shrink-0 w-full">
                          <div className="flex justify-between items-center w-full">
                            <span className="font-['Pretendard:Medium',_sans-serif] text-[#222222] text-[16px]">성인</span>
                            <span className="font-['Pretendard:Bold',_sans-serif] text-[#222222] text-[16px]">{product.adultPrice.toLocaleString()}원</span>
                          </div>
                          <div className="flex justify-between items-center w-full">
                            <span className="font-['Pretendard:Medium',_sans-serif] text-[#222222] text-[16px]">어린이</span>
                            <span className="font-['Pretendard:Bold',_sans-serif] text-[#222222] text-[16px]">{product.childPrice.toLocaleString()}원</span>
                          </div>
                          <div className="flex justify-between items-center w-full">
                            <span className="font-['Pretendard:Medium',_sans-serif] text-[#222222] text-[16px]">유아</span>
                            <span className="font-['Pretendard:Bold',_sans-serif] text-[#222222] text-[16px]">{product.infantPrice.toLocaleString()}원</span>
                          </div>
                        </div>
                        
                        {/* 예약 버튼 */}
                        <div className="box-border content-stretch flex items-center justify-center px-[20px] py-[10px] relative rounded-[4px] shrink-0 w-full h-[50px] bg-design-blue hover:bg-blue-600 transition-colors duration-200">
                          <div className="font-['Pretendard:SemiBold',_sans-serif] leading-[0] not-italic relative shrink-0 text-[17px] text-center text-nowrap text-white">
                            <p className="leading-[30px] whitespace-pre">예약하기</p>
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
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-left text-white">
            <h2 className="text-5xl font-bold mb-8 font-pretendard leading-[70px]">
              <span className="font-normal">단체 여행은</span><br />
              맞춤형 패키지로 편리하게
            </h2>
            
            {/* 버튼 */}
            <div className="inline-flex items-center justify-between px-5 py-2.5 border border-white rounded">
              <span className="font-semibold text-white text-[17px] font-pretendard">
                단체여행 패키지 보기
              </span>
              <div className="w-5 h-5 ml-2">
                <svg className="w-5 h-5 text-white rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 공지사항 및 고객센터 섹션 */}
      <section className="w-full py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="box-border content-stretch flex flex-col lg:flex-row items-center justify-between px-0 py-[100px] relative w-full max-w-[1200px] mx-auto gap-8 lg:gap-0">
              
              {/* 공지사항 섹션 */}
              <div className="content-stretch flex flex-col gap-[50px] items-start relative shrink-0 w-full lg:w-[550px]">
                <div className="content-stretch flex gap-[16px] items-center relative shrink-0">
                  {/* 공지사항 아이콘 */}
                  <div className="h-[51px] overflow-clip relative shrink-0 w-[50px]">
                    <Image
                      src="/images/announcement-icon-1.png"
                      alt="공지사항 아이콘"
                      width={50}
                      height={51}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="font-['Pretendard:Bold',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#222222] text-[34px] text-nowrap">
                    <p className="leading-[50px] whitespace-pre">공지사항</p>
                  </div>
                </div>
                <div className="content-stretch flex flex-col gap-[20px] items-start relative shrink-0 w-full">
                  {/* 공지사항 목록 */}
                  <div className="box-border content-stretch flex items-center justify-between pb-[20px] pt-0 px-0 relative shrink-0 w-full">
                    <div aria-hidden="true" className="absolute border-[#dddddd] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
                    <div className="font-['Pretendard:Medium',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#222222] text-[18px] text-nowrap">
                      <p className="leading-[30px] whitespace-pre">2025 여름 불꽃크루즈!! 7월19일부터 매주 토요일</p>
                    </div>
                    <div className="font-['Pretendard:Regular',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#666666] text-[16px] text-nowrap">
                      <p className="leading-[26px] whitespace-pre">2025-06-09</p>
                    </div>
                  </div>
                  <div className="box-border content-stretch flex items-center justify-between pb-[20px] pt-0 px-0 relative shrink-0 w-full">
                    <div aria-hidden="true" className="absolute border-[#dddddd] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
                    <div className="font-['Pretendard:Medium',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#222222] text-[18px] text-nowrap">
                      <p className="leading-[30px] whitespace-pre">2025년 정기검사 휴항안내</p>
                    </div>
                    <div className="font-['Pretendard:Regular',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#666666] text-[16px] text-nowrap">
                      <p className="leading-[26px] whitespace-pre">2025-06-09</p>
                    </div>
                  </div>
                  <div className="box-border content-stretch flex items-center justify-between pb-[20px] pt-0 px-0 relative shrink-0 w-full">
                    <div aria-hidden="true" className="absolute border-[#dddddd] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
                    <div className="font-['Pretendard:Medium',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#222222] text-[18px] text-nowrap">
                      <p className="leading-[30px] whitespace-pre">(예고편)덕적도&월미도 유람선_ 찾아가는 국악버</p>
                    </div>
                    <div className="font-['Pretendard:Regular',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#666666] text-[16px] text-nowrap">
                      <p className="leading-[26px] whitespace-pre">2025-06-09</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 고객센터 섹션 */}
              <div className="content-stretch flex flex-col gap-[50px] h-auto lg:h-[290px] items-start relative shrink-0 w-full lg:w-[550px]">
                <div className="content-stretch flex gap-[16px] items-center relative shrink-0">
                  {/* 고객센터 아이콘 */}
                  <div className="h-[52px] overflow-clip relative shrink-0 w-[60px]">
                    <Image
                      src="/images/help-icon-1.png"
                      alt="도와드릴까요 아이콘"
                      width={60}
                      height={52}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="font-['Pretendard:Bold',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#222222] text-[34px] text-nowrap">
                    <p className="leading-[50px] whitespace-pre">도와드릴까요?</p>
                  </div>
                </div>
                <div className="content-stretch flex flex-col lg:flex-row items-end justify-between relative shrink-0 w-full gap-6 lg:gap-0">
                  <div className="content-stretch flex flex-col gap-[20px] items-start leading-[0] not-italic relative shrink-0 text-nowrap">
                    <div className="content-stretch flex flex-col font-['Pretendard:Bold',_sans-serif] gap-[4px] items-start relative shrink-0 text-[#222222]">
                      <div className="relative shrink-0 text-[16px]">
                        <p className="leading-[26px] text-nowrap whitespace-pre">예약 및 상담안내</p>
                      </div>
                      <div className="relative shrink-0 text-[34px]">
                        <p className="leading-[50px] text-nowrap whitespace-pre">032-765-1171</p>
                      </div>
                    </div>
                    <div className="font-['Pretendard:Medium',_sans-serif] leading-[26px] relative shrink-0 text-[#666666] text-[16px] whitespace-pre">
                      <p className="mb-0">평일 · 주말 09시~18시 (연중무휴)</p>
                      <p>전화문의 주시면 정성껏 답변해드립니다.</p>
                    </div>
                  </div>
                  <div className="content-stretch flex flex-col gap-[10px] items-start justify-center relative shrink-0 w-full lg:w-[200px]">
                    {/* 자주 묻는 질문 버튼 */}
                    <div className="bg-white relative rounded-[4px] shrink-0 w-full">
                      <div aria-hidden="true" className="absolute border border-[#222222] border-solid inset-0 pointer-events-none rounded-[4px]" />
                      <div className="flex flex-row items-center size-full">
                        <div className="box-border content-stretch flex items-center justify-between px-[20px] py-[10px] relative w-full">
                          <div className="font-['Pretendard:SemiBold',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#222222] text-[17px] text-center text-nowrap">
                            <p className="leading-[30px] whitespace-pre">자주 묻는 질문</p>
                          </div>
                          <div className="flex h-[20px] items-center justify-center relative shrink-0 w-[20px]">
                            <div className="flex-none rotate-[90deg]">
                              <div className="relative size-[20px]">
                                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
                                  <g>
                                    <path d="M5 15l7-7 7 7" stroke="var(--stroke-0, #222222)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                                  </g>
                                </svg>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* 고객센터 버튼 */}
                    <div className="bg-white relative rounded-[4px] shrink-0 w-full">
                      <div aria-hidden="true" className="absolute border border-[#222222] border-solid inset-0 pointer-events-none rounded-[4px]" />
                      <div className="flex flex-row items-center size-full">
                        <div className="box-border content-stretch flex items-center justify-between px-[20px] py-[10px] relative w-full">
                          <div className="font-['Pretendard:SemiBold',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#222222] text-[17px] text-center text-nowrap">
                            <p className="leading-[30px] whitespace-pre">고객센터</p>
                          </div>
                          <div className="flex h-[20px] items-center justify-center relative shrink-0 w-[20px]">
                            <div className="flex-none rotate-[90deg]">
                              <div className="relative size-[20px]">
                                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
                                  <g>
                                    <path d="M5 15l7-7 7 7" stroke="var(--stroke-0, #222222)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                                  </g>
                                </svg>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
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
