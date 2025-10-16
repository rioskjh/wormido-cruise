'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
// import Image from 'next/image' // 이미지 최적화 비활성화
import UserNavigation from '@/components/UserNavigation'
import Footer from '@/components/Footer'
import ProductSection from '@/components/ProductSection'
import GroupTravelSection from '@/components/GroupTravelSection'
import MobileAnnouncementSection from '@/components/MobileAnnouncementSection'
import MobileCustomerServiceSection from '@/components/MobileCustomerServiceSection'

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
      {/* 개발자 도구용 디버그 정보 */}
      <div style={{display: 'none'}} data-debug-info="페이지 빌드 시간: 2025-10-15T11:09:56.279Z, 배경색: #4C9DE8" />
      
      {/* 시각적 디버그 - 개발 모드에서만 표시 */}
      <div style={{
        position: 'fixed',
        bottom: '10px',
        right: '10px',
        background: '#4C9DE8',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '12px',
        zIndex: 9999,
        border: '2px solid #fff'
      }}>
        배경색: #4C9DE8<br/>
        빌드시간: 2025-10-15T11:09:56.279Z
      </div>
      
      {/* 네비게이션 */}
      <UserNavigation />

      {/* 메인 비주얼 섹션 */}
      <section className="relative w-full">
        {/* 모바일 버전 */}
        <div className="md:hidden relative w-full">
          <div className="relative w-full">
            <div className="size-full">
              <div className="box-border content-stretch flex flex-col items-start pb-0 pt-[20px] px-[15px] relative w-full">
            {/* 배경 */}
                <div 
                  className="absolute h-[220px] left-0 top-0 w-[360px]" 
                  style={{backgroundColor: '#4C9DE8'}}
                  data-debug="모바일 배경색: #4C9DE8 (밝은 파란색)"
                />
            
            {/* 메인 콘텐츠 */}
                <div className="content-stretch flex flex-col gap-[20px] items-start relative shrink-0 w-full">
                  {/* 텍스트 */}
                  <div className="content-stretch flex flex-col gap-[6px] items-start leading-[0] not-italic relative shrink-0 text-nowrap text-white">
                    <div className="font-['Pretendard:ExtraBold',_sans-serif] leading-[32px] relative shrink-0 text-[22px] whitespace-pre">
                      <p className="mb-0">푸른 바다 위에서</p>
                      <p>만나는 특별한 하루</p>
                    </div>
                    <div className="font-['Pretendard:Regular',_sans-serif] relative shrink-0 text-[13px]">
                      <p className="leading-[22px] text-nowrap whitespace-pre">월미도 해양관광 크루즈와 함께하는 잊지 못할 여행</p>
                    </div>
                  </div>
                  
                  {/* 크루즈 이미지 */}
                  <div className="h-[186px] relative shrink-0 w-[330px]">
                    <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
                      <img
                        alt=""
                        className="absolute max-w-none object-50%-50% object-cover size-full"
                        src="/images/91582b55f45f475993db95e57fe119b1b197944f.png"
                      />
                      <div className="absolute inset-0" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 데스크톱 버전 */}
        <div className="hidden md:block h-[703px] relative w-full">
          {/* 배경 - 파란색 박스와 이미지를 하나로 합쳐서 브라우저 가로 사이즈 꽉 차게 */}
          <div className="absolute inset-0 w-full h-full">
            {/* 파란색 배경 */}
            <div 
              className="absolute h-[450px] left-0 top-1/2 -translate-y-1/2 w-full" 
              style={{backgroundColor: '#4C9DE8'}}
              data-debug="배경색: #4C9DE8 (밝은 파란색)"
              title="배경색: #4C9DE8 (밝은 파란색)"
            />
            {/* 크루즈 이미지 - 세로 중앙 정렬 */}
            <div className="absolute h-[703px] left-[calc(50%-300px)] top-1/2 -translate-y-1/2 w-[1250px] overflow-hidden">
                <img
                  src="/images/91582b55f45f475993db95e57fe119b1b197944f.png"
                  alt="월미도 크루즈"
                  width={1250}
                  height={703}
                  className="w-full h-full object-cover"
                />
            </div>
              </div>
              
          {/* 텍스트 오버레이 - 1200px 컨텐츠 안에서 하단 컨텐츠들과 중앙 정렬 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="container mx-auto px-4 max-w-[1200px]">
              <div className="content-stretch flex flex-col gap-[30px] h-[262px] items-start relative shrink-0 w-full">
                  {/* 메인 타이틀 */}
                <div className="box-border content-stretch flex gap-[10px] items-center pl-0 pr-[20px] py-[10px] relative shrink-0">
                  <div className="font-['Pretendard:ExtraBold',_sans-serif] leading-[76px] not-italic relative shrink-0 text-[56px] text-nowrap text-white whitespace-pre">
                      <p className="mb-0">푸른 바다 위에서</p>
                      <p>만나는 특별한 하루</p>
                    </div>
                  </div>
                  
                  {/* 서브 타이틀 */}
                <div className="box-border content-stretch flex gap-[10px] items-center pl-0 pr-[20px] py-[10px] relative shrink-0">
                  <div className="font-['Pretendard:Regular',_sans-serif] leading-[0] not-italic relative shrink-0 text-[20px] text-nowrap text-white">
                    <p className="leading-[32px] whitespace-pre">월미도 해양관광 크루즈와 함께하는 잊지 못할 여행</p>
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
          {/* 모바일 버전 */}
          <div className="md:hidden relative w-full">
            <div className="flex flex-row items-center size-full">
              <div className="box-border content-stretch flex gap-[10px] items-center px-0 py-0 relative w-full">
            {/* 승선권 예매하기 카드 */}
            <Link 
              href="/reservation" 
                  className="bg-white box-border content-stretch flex flex-col gap-[10px] items-start px-[17px] py-[20px] relative rounded-[10px] shrink-0 w-[160px]"
            >
                  <div aria-hidden="true" className="absolute border border-[#222222] border-solid inset-0 pointer-events-none rounded-[10px] shadow-[2px_2px_4px_0px_rgba(0,0,0,0.2)]" />
                  {/* 아이콘 */}
                  <div className="relative shrink-0 size-[40px]">
                    <img alt="승선권 예매하기" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src="/images/pc-ticket-icon.png" />
                  </div>
                
                  {/* 텍스트 */}
                  <div className="content-stretch flex flex-col gap-[4px] items-start leading-[0] not-italic relative shrink-0 text-nowrap">
                    <div className="font-['Pretendard:Bold',_sans-serif] relative shrink-0 text-[#222222] text-[16px]">
                      <p className="leading-[26px] text-nowrap whitespace-pre">승선권 예매하기</p>
                    </div>
                    <div className="font-['Pretendard:Regular',_sans-serif] leading-[19px] relative shrink-0 text-[#444444] text-[11px] whitespace-pre">
                      <p className="mb-0">원하는 일정과 좌석을</p>
                      <p>간편하게 선택</p>
                </div>
              </div>
            </Link>

            {/* 예약확인 및 취소 카드 */}
            <Link 
              href="/reservation/check" 
                  className="bg-white box-border content-stretch flex flex-col gap-[10px] items-start px-[17px] py-[20px] relative rounded-[10px] shrink-0 w-[160px]"
                >
                  <div aria-hidden="true" className="absolute border border-[#222222] border-solid inset-0 pointer-events-none rounded-[10px] shadow-[2px_2px_4px_0px_rgba(0,0,0,0.2)]" />
                  {/* 아이콘 */}
                  <div className="relative shrink-0 size-[40px]">
                    <img alt="예약확인 및 취소" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src="/images/pc-receipt-icon.png" />
                  </div>
                  
                  {/* 텍스트 */}
                  <div className="content-stretch flex flex-col gap-[6px] items-start justify-center leading-[0] not-italic relative shrink-0 text-nowrap">
                    <div className="font-['Pretendard:Bold',_sans-serif] relative shrink-0 text-[#222222] text-[16px]">
                      <p className="leading-[26px] text-nowrap whitespace-pre">예약확인 및 취소</p>
                    </div>
                    <div className="font-['Pretendard:Regular',_sans-serif] leading-[19px] relative shrink-0 text-[#444444] text-[11px] whitespace-pre">
                      <p className="mb-0">예약 내역을</p>
                      <p>한눈에 확인하세요.</p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* 데스크톱 버전 */}
          <div className="hidden md:flex box-border content-stretch justify-between items-center px-0 py-[50px] relative w-full max-w-[1200px] mx-auto">
            {/* 승선권 예매하기 카드 */}
            <Link 
              href="/reservation" 
              className="bg-white box-border content-stretch flex items-center justify-between px-[50px] py-[40px] relative rounded-[10px] shrink-0 w-[585px]"
            >
              <div aria-hidden="true" className="absolute border border-[#222222] border-solid inset-0 pointer-events-none rounded-[10px] shadow-[2px_2px_4px_0px_rgba(0,0,0,0.4)]" />
              <div className="content-stretch flex gap-[40px] items-center relative shrink-0">
                  {/* 아이콘 */}
                <div className="relative shrink-0 size-[90px]">
                  <img alt="승선권 예매하기" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src="/images/pc-ticket-icon.png" />
                </div>
                  
                  {/* 텍스트 */}
                <div className="content-stretch flex flex-col gap-[6px] items-start leading-[0] not-italic relative shrink-0 text-nowrap">
                  <div className="font-['Pretendard:Bold',_sans-serif] relative shrink-0 text-[#222222] text-[26px]">
                    <p className="leading-[36px] text-nowrap whitespace-pre">승선권 예매하기</p>
                  </div>
                  <div className="font-['Pretendard:Regular',_sans-serif] relative shrink-0 text-[#444444] text-[18px]">
                    <p className="leading-[30px] text-nowrap whitespace-pre">원하는 일정과 좌석을 간편하게 선택</p>
                  </div>
                  </div>
                </div>
                
                {/* 화살표 */}
              <div className="flex h-[36.924px] items-center justify-center relative shrink-0 w-[36.924px]">
                <div className="flex-none rotate-[45deg]">
                  <div className="h-[27.231px] relative w-[25px]">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 25 28">
                      <path d="M11.5385 27.2308V3.67308L1.44231 13.7692L0 12.5L12.5 0L25 12.5L23.5577 13.7692L13.4615 3.67308V27.2308H11.5385Z" fill="var(--fill-0, #222222)" id="Vector" />
                  </svg>
                  </div>
                </div>
              </div>
            </Link>

            {/* 예약확인 및 취소 카드 */}
            <Link 
              href="/reservation/check" 
              className="bg-white box-border content-stretch flex items-center justify-between px-[50px] py-[40px] relative rounded-[10px] shrink-0 w-[585px]"
            >
              <div aria-hidden="true" className="absolute border border-[#222222] border-solid inset-0 pointer-events-none rounded-[10px] shadow-[2px_2px_4px_0px_rgba(0,0,0,0.4)]" />
              <div className="content-stretch flex gap-[40px] items-center relative shrink-0">
                  {/* 아이콘 */}
                <div className="relative shrink-0 size-[90px]">
                  <img alt="예약확인 및 취소" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src="/images/pc-receipt-icon.png" />
                </div>
                  
                  {/* 텍스트 */}
                <div className="content-stretch flex flex-col gap-[6px] items-start justify-center leading-[0] not-italic relative shrink-0 text-nowrap">
                  <div className="font-['Pretendard:Bold',_sans-serif] relative shrink-0 text-[#222222] text-[26px]">
                    <p className="leading-[36px] text-nowrap whitespace-pre">예약확인 및 취소</p>
                  </div>
                  <div className="font-['Pretendard:Regular',_sans-serif] relative shrink-0 text-[#444444] text-[18px]">
                    <p className="leading-[30px] text-nowrap whitespace-pre">예약 내역을 한눈에 확인하세요.</p>
                  </div>
                  </div>
                </div>
                
                {/* 화살표 */}
              <div className="flex h-[36.924px] items-center justify-center relative shrink-0 w-[36.924px]">
                <div className="flex-none rotate-[45deg]">
                  <div className="h-[27.231px] relative w-[25px]">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 25 28">
                      <path d="M11.5385 27.2308V3.67308L1.44231 13.7692L0 12.5L12.5 0L25 12.5L23.5577 13.7692L13.4615 3.67308V27.2308H11.5385Z" fill="var(--fill-0, #222222)" id="Vector" />
                  </svg>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 상품소개 섹션 */}
      <section className="w-full py-4">
        <div className="container mx-auto px-4">
          <div className="max-w-[1200px] mx-auto">
            <ProductSection products={products} loading={loading} error={error} />
          </div>
        </div>
      </section>

      {/* 단체여행 섹션 */}
      <section className="w-full py-8 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-[1200px] mx-auto">
            <GroupTravelSection />
          </div>
        </div>
      </section>

      {/* 공지사항 및 고객센터 섹션 */}
      <section className="w-full py-10 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-[1200px] mx-auto">
            {/* 모바일 버전 */}
            <div className="md:hidden box-border content-stretch flex flex-col gap-[40px] items-start px-[15px] py-[40px] relative w-full">
              <MobileAnnouncementSection />
              <MobileCustomerServiceSection />
            </div>

            {/* 데스크톱 버전 */}
            <div className="hidden md:flex box-border content-stretch items-start justify-between px-0 py-[50px] relative w-full gap-[50px]">
              
              {/* 공지사항 섹션 */}
              <div className="content-stretch flex flex-col gap-[50px] items-start relative shrink-0 w-[550px]">
                <div className="content-stretch flex gap-[16px] items-center relative shrink-0">
                  {/* 공지사항 아이콘 */}
            <div className="relative shrink-0 size-[30px]">
              <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src="/images/7ee2e80c76ff5461678242b1f2ed1baba366c81d.png" />
              <div className="absolute bottom-[17.19%] contents left-0 right-[56.81%] top-[38.28%] hidden">
            <div className="absolute inset-[38.28%_56.81%_22.54%_19.89%]">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <img alt="" className="absolute left-0 max-w-none size-full top-0" src="/images/64d191de22328fc842768e48b26b9394a5b5ab47.png" />
              </div>
            </div>
            <div className="absolute bottom-[17.19%] left-0 right-[85.9%] top-[51.77%]">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <img alt="" className="absolute left-0 max-w-none size-full top-0" src="/images/22d24d7472770b7bed8a2b448033eafffb5098dd.png" />
              </div>
            </div>
          </div>
          <div className="absolute contents inset-[38.28%_56.81%_22.54%_19.89%]">
            <div className="absolute inset-[38.28%_56.81%_22.54%_19.89%]">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <img alt="" className="absolute left-0 max-w-none size-full top-0" src="/images/2ccd7698f223ed8ac8ad50b12f73eb0c0a43e2aa.png" />
          </div>
        </div>
          </div>
          <div className="absolute contents inset-[38.28%_56.81%_15.76%_1.21%]">
            <div className="absolute inset-[38.28%_56.81%_21.12%_18.6%]">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <img alt="" className="absolute left-0 max-w-none size-full top-0" src="/images/c7253b87b054d1dd3e3c8f46a3088a4a2fd69213.png" />
              </div>
            </div>
            <div className="absolute inset-[38.28%_61.74%_15.76%_1.21%]">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <img alt="" className="absolute left-0 max-w-none size-full top-0" src="/images/2101fec5a48507ed70aba03be6824d18ba282d20.png" />
              </div>
            </div>
          </div>
          <div className="absolute contents inset-[77.79%_56.98%_-0.01%_18.28%]">
            <div className="absolute inset-[77.79%_56.98%_1.76%_31.42%]">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <img alt="" className="absolute left-0 max-w-none size-full top-0" src="/images/c79153f351f85f5e3149f57898384fe02c2ba1fc.png" />
              </div>
                    </div>
            <div className="absolute inset-[77.79%_60.12%_0.12%_18.28%]">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <img alt="" className="absolute left-0 max-w-none size-full top-0" src="/images/09c1bd11238a733b8f09486ba072e8a3bf87d111.png" />
                    </div>
                  </div>
            <div className="absolute inset-[96.98%_56.98%_-0.01%_37.3%]">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <img alt="" className="absolute left-0 max-w-none size-full top-0" src="/images/310401f53d681198bb1967a9321e7439fce65a8c.png" />
                          </div>
                          </div>
                        </div>
          <div className="absolute bottom-[4.4%] contents left-[28.91%] right-0 top-[-0.01%]">
            <div className="absolute contents inset-[6.69%_6.49%_11.55%_36.51%]">
              <div className="absolute inset-[6.69%_14.4%_59.33%_36.51%]">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <img alt="" className="absolute left-0 max-w-none size-full top-0" src="/images/f16b61d580d2c8488b5d486a916a1b35febcc33d.png" />
                          </div>
                          </div>
              <div className="absolute inset-[48.3%_6.49%_11.55%_47.67%]">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <img alt="" className="absolute left-0 max-w-none size-full top-0" src="/images/df5b5270e64c1efef303cfbe9ab0e0183a05aaeb.png" />
          </div>
          </div>
              <div className="absolute inset-[29.87%_7.69%_45.15%_71.36%]">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <img alt="" className="absolute left-0 max-w-none size-full top-0" src="/images/19c2cd15e2a3adcc854a190d984e670fb5257240.png" />
                    </div>
                    </div>
                  </div>
            <div className="absolute contents inset-[33.06%_17.24%_29.16%_36.54%]">
              <div className="absolute inset-[33.06%_18.95%_29.16%_36.54%]">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <img alt="" className="absolute left-0 max-w-none size-full top-0" src="/images/1c6d3825b4051182a842e6339b1e7398be7a8965.png" />
                    </div>
                          </div>
              <div className="absolute inset-[33.29%_17.24%_45.22%_67.55%]">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <img alt="" className="absolute left-0 max-w-none size-full top-0" src="/images/613c682a9e14cf749100ba778200f67f2fa24120.png" />
                          </div>
                        </div>
                          </div>
            <div className="absolute contents inset-[3.87%_5.03%_7.88%_50.11%]">
              <div className="absolute inset-[3.87%_5.03%_7.88%_50.11%]">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <img alt="" className="absolute left-0 max-w-none size-full top-0" src="/images/e2cc39b8f39259ab624e968dd44533a7e6c1ccd6.png" />
                          </div>
                          </div>
                        </div>
            <div className="absolute bottom-[4.4%] left-[28.91%] right-0 top-[-0.01%]">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <img alt="" className="absolute left-0 max-w-none size-full top-0" src="/images/20b031043783dfb6cd816eafe71580af4b9d2cd0.png" />
                          </div>
                        </div>
                      </div>
                    </div>
                  <div className="font-['Pretendard:Bold',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#222222] text-[34px] text-nowrap">
                    <p className="leading-[50px] whitespace-pre">공지사항</p>
                  </div>
                </div>
                <div className="content-stretch flex flex-col gap-[20px] items-start relative shrink-0 w-full">
                  {/* 공지사항 목록 */}
                  <div className="box-border content-stretch flex items-center justify-between pb-[20px] pt-0 px-0 relative shrink-0 w-full border-b border-[#dddddd]">
                    <div className="font-['Pretendard:Medium',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#222222] text-[18px] text-nowrap">
                      <p className="leading-[30px] whitespace-pre">2025 여름 불꽃크루즈!! 7월19일부터 매주 토요일</p>
                    </div>
                    <div className="font-['Pretendard:Regular',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#666666] text-[16px] text-nowrap">
                      <p className="leading-[26px] whitespace-pre">2025-06-09</p>
                    </div>
                  </div>
                  <div className="box-border content-stretch flex items-center justify-between pb-[20px] pt-0 px-0 relative shrink-0 w-full border-b border-[#dddddd]">
                    <div className="font-['Pretendard:Medium',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#222222] text-[18px] text-nowrap">
                      <p className="leading-[30px] whitespace-pre">2025년 정기검사 휴항안내</p>
                        </div>
                    <div className="font-['Pretendard:Regular',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#666666] text-[16px] text-nowrap">
                      <p className="leading-[26px] whitespace-pre">2025-06-09</p>
                    </div>
                      </div>
                  <div className="box-border content-stretch flex items-center justify-between pb-[20px] pt-0 px-0 relative shrink-0 w-full border-b border-[#dddddd]">
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
              <div className="content-stretch flex flex-col gap-[50px] h-auto lg:h-[290px] items-start relative shrink-0 w-[550px]">
                <div className="content-stretch flex gap-[16px] items-center relative shrink-0">
                  {/* 고객센터 아이콘 */}
            <div className="h-[26px] relative shrink-0 w-[30px]">
              <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src="/images/1fa5765c4779a9313c292915da45c9fb833e327f.png" />
              <div className="absolute bottom-[-0.01%] contents left-0 right-[-0.01%] top-[-0.01%] hidden">
            <div className="absolute contents inset-[-0.01%_7.55%]">
              <div className="absolute inset-[-0.01%_7.55%_3.17%_7.55%]">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <img alt="" className="absolute left-0 max-w-none size-full top-0" src="/images/c29328f510bd7a3d0c557f4d9f85fb8397d27317.png" />
                </div>
              </div>
              <div className="absolute inset-[89.33%_42.79%_-0.01%_43.48%]">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <img alt="" className="absolute left-0 max-w-none size-full top-0" src="/images/a35bf6d8b0e05d385841d46591bea6403d6eaed3.png" />
                </div>
              </div>
            </div>
            <div className="absolute bottom-[31.45%] contents left-0 right-[-0.01%] top-[35.11%]">
              <div className="absolute bottom-[31.45%] left-0 right-[84.05%] top-[35.11%]">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <img alt="" className="absolute left-0 max-w-none size-full top-0" src="/images/8922df1b2bf0b8b6697fa4c89c1cd63d68f53353.png" />
                </div>
        </div>
              <div className="absolute inset-[35.11%_-0.01%_31.45%_84.05%]">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <img alt="" className="absolute left-0 max-w-none size-full top-0" src="/images/eeb8f520b4bc92348b87a310be89ee94675caeba.png" />
              </div>
            </div>
          </div>
        </div>
          <div className="absolute contents inset-[14.21%_20.02%_15.78%_20.01%]">
            <div className="absolute contents inset-[14.21%_20.02%_15.78%_20.01%]">
              <div className="absolute inset-[70.68%_57.86%_15.78%_22.97%]">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <img alt="" className="absolute left-0 max-w-none size-full top-0" src="/images/643e2a0b679e35a1103f8a5dc36de1cfe663bf90.png" />
                </div>
                    </div>
              <div className="absolute inset-[14.21%_20.02%_17.39%_20.01%]">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <img alt="" className="absolute left-0 max-w-none size-full top-0" src="/images/23f3e595ddd0c70c1ad7113d7a273a961cfacec1.png" />
                    </div>
                  </div>
                        </div>
            <div className="absolute contents inset-[43.56%_34.4%_46.75%_34.4%]">
              <div className="absolute contents inset-[43.56%_34.4%_46.75%_34.4%]">
                <div className="absolute inset-[43.56%_57.1%_46.75%_34.4%]">
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <img alt="" className="absolute left-0 max-w-none size-full top-0" src="/images/971357026188be785b9d393d04ae4a0b1f1301ba.png" />
                      </div>
                    </div>
                <div className="absolute inset-[43.56%_45.76%_46.75%_45.75%]">
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <img alt="" className="absolute left-0 max-w-none size-full top-0" src="/images/73483606bdc4217a8cf4a32cc7c3ce86fcc26f37.png" />
                      </div>
                    </div>
                <div className="absolute inset-[43.56%_34.4%_46.75%_57.1%]">
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <img alt="" className="absolute left-0 max-w-none size-full top-0" src="/images/601b9426e9ccb3cd9634d0f1069235b387a2e55b.png" />
                      </div>
                    </div>
                  </div>
                  </div>
                </div>
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

