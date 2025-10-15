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
                <div className="absolute bg-[#4C9DE8] h-[220px] left-0 top-0 w-[360px]" />
            
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
            <div className="absolute bg-[#4C9DE8] h-[450px] left-0 top-1/2 -translate-y-1/2 w-full" />
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
                  className="bg-[#d7dfff] box-border content-stretch flex flex-col gap-[10px] items-start px-[17px] py-[20px] relative rounded-[10px] shrink-0 w-[160px]"
            >
                  {/* 아이콘 */}
                  <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
                    <div className="[grid-area:1_/_1] ml-0 mt-0 relative size-[40px]">
                      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 40 40">
                        <circle cx="20" cy="20" fill="var(--fill-0, white)" id="Ellipse 3" r="20" />
                      </svg>
                    </div>
                    <div className="[grid-area:1_/_1] grid-cols-[max-content] grid-rows-[max-content] inline-grid ml-[17.5%] mt-[17.5%] place-items-start relative">
                      <div className="[grid-area:1_/_1] grid-cols-[max-content] grid-rows-[max-content] inline-grid ml-[5.207%] mt-[11.459%] place-items-start relative">
                        <div className="[grid-area:1_/_1] h-[20.042px] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-1.354px_-2.979px] mask-size-[26px_26px] ml-0 mt-0 relative w-[23.292px]" style={{ maskImage: `url("data:image/svg+xml,%3Csvg%20preserveAspectRatio%3D%22none%22%20width%3D%22100%25%22%20height%3D%22100%25%22%20overflow%3D%22visible%22%20style%3D%22display%3A%20block%3B%22%20viewBox%3D%220%200%2026%2026%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%0A%3Cg%20id%3D%22clippath%22%3E%0A%3Cpath%20id%3D%22Vector%22%20d%3D%22M26%200H0V26H26V0Z%22%20fill%3D%22var(--fill-0%2C%20black)%22%2F%3E%0A%3C%2Fg%3E%0A%3C%2Fsvg%3E%0A")` }}>
                          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 21">
                            <g id="ticket 2">
                              <path d="M8.85417 0C3.96354 0 0 3.96354 0 8.85417V14.1667C0 14.9089 0.523438 15.5495 1.2526 15.6979C2.91406 16.0365 4.16667 17.5078 4.16667 19.2708C4.16667 21.0339 2.91406 22.5052 1.2526 22.8438C0.523438 22.9922 0 23.6328 0 24.375V29.6875C0 34.5781 3.96354 38.5417 8.85417 38.5417H35.9375C40.8281 38.5417 44.7917 34.5781 44.7917 29.6875V24.375C44.7917 23.6328 44.2682 22.9922 43.5391 22.8438C41.8776 22.5052 40.625 21.0339 40.625 19.2708C40.625 17.5078 41.8776 16.0365 43.5391 15.6979C44.2682 15.5495 44.7917 14.9089 44.7917 14.1667V8.85417C44.7917 3.96354 40.8281 0 35.9375 0H8.85417Z" fill="var(--fill-0, #2D68FF)" id="Vector 298" opacity="0.4" />
                              <path clipRule="evenodd" d="M30.2083 1.58946e-07V9.3099C30.2083 10.1719 29.5078 10.8724 28.6458 10.8724C27.7839 10.8724 27.0833 10.1719 27.0833 9.3099V1.58946e-07H30.2083ZM28.6458 14.388C29.5078 14.388 30.2083 15.0885 30.2083 15.9505V22.5911C30.2083 23.4531 29.5078 24.1536 28.6458 24.1536C27.7839 24.1536 27.0833 23.4531 27.0833 22.5911V15.9505C27.0833 15.0885 27.7839 14.388 28.6458 14.388ZM28.6458 27.6693C29.5078 27.6693 30.2083 28.3698 30.2083 29.2318V38.5417H27.0833V29.2318C27.0833 28.3698 27.7839 27.6693 28.6458 27.6693Z" fill="var(--fill-0, #2D68FF)" fillRule="evenodd" id="Vector 299" />
                            </g>
                    </svg>
                  </div>
                      </div>
                  </div>
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
                  className="bg-[#f6dfed] box-border content-stretch flex flex-col gap-[10px] items-start px-[17px] py-[20px] relative rounded-[10px] shrink-0 w-[160px]"
                >
                  {/* 아이콘 */}
                  <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
                    <div className="[grid-area:1_/_1] ml-0 mt-0 relative size-[40px]">
                      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 40 40">
                        <circle cx="20" cy="20" fill="var(--fill-0, white)" id="Ellipse 3" r="20" />
                      </svg>
                    </div>
                    <div className="[grid-area:1_/_1] grid-cols-[max-content] grid-rows-[max-content] inline-grid ml-[17.5%] mt-[17.5%] place-items-start relative">
                      <div className="[grid-area:1_/_1] grid-cols-[max-content] grid-rows-[max-content] inline-grid ml-[5.208%] mt-[5.215%] place-items-start relative">
                        <div className="[grid-area:1_/_1] h-[23.293px] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-1.354px_-1.356px] mask-size-[26px_26px] ml-0 mt-0 relative w-[23.292px]" style={{ maskImage: `url("data:image/svg+xml,%3Csvg%20preserveAspectRatio%3D%22none%22%20width%3D%22100%25%22%20height%3D%22100%25%22%20overflow%3D%22visible%22%20style%3D%22display%3A%20block%3B%22%20viewBox%3D%220%200%2026%2026%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%0A%3Cg%20id%3D%22clippath%22%3E%0A%3Cpath%20id%3D%22Vector%22%20d%3D%22M26%200H0V26H26V0Z%22%20fill%3D%22var(--fill-0%2C%20black)%22%2F%3E%0A%3C%2Fg%3E%0A%3C%2Fsvg%3E%0A")` }}>
                          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
                            <g id="receipt-1 2">
                              <path d="M23.7135 0.697348C22.263 -0.357339 20.2578 -0.201089 18.9896 1.06714L17.4271 2.62964C17.237 2.81974 16.9323 2.83537 16.7266 2.66089L15.3542 1.52026C12.9792 -0.458902 9.375 1.2286 9.375 4.31974V38.0177C9.375 43.226 7.74219 44.7885 5.72917 44.7885H35.9427C40.8333 44.7885 44.7917 40.8223 44.7917 35.9343V4.31974C44.7917 1.2286 41.1875 -0.458902 38.8125 1.51766L37.4401 2.66089C37.2344 2.83537 36.9297 2.81974 36.7396 2.62964L35.1771 1.06714C33.9089 -0.201089 31.9036 -0.357339 30.4531 0.697348L27.3906 2.92651C27.2083 3.05933 26.9583 3.05933 26.776 2.92651L23.7135 0.697348Z" fill="var(--fill-0, #F6D3E9)" id="Vector 290" />
                              <g id="Vector 291">
                                <path d="M20.8333 32.2989C19.9714 32.2989 19.2708 31.5984 19.2708 30.7364C19.2708 29.8744 19.9714 29.1739 20.8333 29.1739H33.3333C34.1953 29.1739 34.8958 29.8718 34.8958 30.7364C34.8958 31.601 34.1953 32.2989 33.3333 32.2989H20.8333Z" fill="var(--fill-0, #DA93BE)" id="Vector" />
                                <path d="M18.75 25.0098C17.888 25.0098 17.1875 24.3093 17.1875 23.4473C17.1875 22.5854 17.888 21.8848 18.75 21.8848H35.4167C36.2786 21.8848 36.9792 22.5828 36.9792 23.4473C36.9792 24.3119 36.2786 25.0098 35.4167 25.0098H18.75Z" fill="var(--fill-0, #DA93BE)" id="Vector_2" />
                                <path d="M22.9167 17.7208C22.0547 17.7208 21.3542 17.0203 21.3542 16.1583C21.3542 15.2963 22.0547 14.5958 22.9167 14.5958H31.25C32.112 14.5958 32.8125 15.2937 32.8125 16.1583C32.8125 17.0229 32.112 17.7208 31.25 17.7208H22.9167Z" fill="var(--fill-0, #DA93BE)" id="Vector_3" />
                                <path d="M2.60417 22.9239H9.375V38.0177C9.375 43.0619 7.84375 44.6869 5.91667 44.7833C2.61979 44.6114 -7.94729e-08 41.8822 -7.94729e-08 38.5437V25.5281C-7.94729e-08 24.0906 1.16667 22.9239 2.60417 22.9239Z" fill="var(--fill-0, #DA93BE)" id="Vector_4" />
                                <path d="M6.25 44.7937C6.32552 44.7937 6.40104 44.7911 6.47917 44.7885H6.02344C6.09896 44.7911 6.17448 44.7937 6.2526 44.7937H6.25Z" fill="var(--fill-0, #2D68FF)" id="Vector_5" />
                              </g>
                            </g>
                          </svg>
                        </div>
                      </div>
                    </div>
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
              className="bg-[#d7dfff] box-border content-stretch flex items-center justify-between px-[30px] py-[40px] relative rounded-[10px] shrink-0 w-[580px]"
            >
              <div className="content-stretch flex gap-[40px] items-center relative shrink-0">
                  {/* 아이콘 */}
                <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
                  <div className="[grid-area:1_/_1] ml-0 mt-0 relative size-[90px]">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 90 90">
                      <circle cx="45" cy="45" fill="var(--fill-0, white)" id="Ellipse 3" r="45" />
                    </svg>
                  </div>
                  <div className="[grid-area:1_/_1] grid-cols-[max-content] grid-rows-[max-content] inline-grid ml-[22.222%] mt-[22.222%] place-items-start relative">
                    <div className="[grid-area:1_/_1] grid-cols-[max-content] grid-rows-[max-content] inline-grid ml-[5.208%] mt-[11.458%] place-items-start relative">
                      <div className="[grid-area:1_/_1] h-[38.542px] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-2.604px_-5.729px] mask-size-[50px_50px] ml-0 mt-0 relative w-[44.792px]" style={{ maskImage: `url("data:image/svg+xml,%3Csvg%20preserveAspectRatio%3D%22none%22%20width%3D%22100%25%22%20height%3D%22100%25%22%20overflow%3D%22visible%22%20style%3D%22display%3A%20block%3B%22%20viewBox%3D%220%200%2050%2050%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%0A%3Cg%20id%3D%22clippath%22%3E%0A%3Cpath%20id%3D%22Vector%22%20d%3D%22M50%200H0V50H50V0Z%22%20fill%3D%22var(--fill-0%2C%20black)%22%2F%3E%0A%3C%2Fg%3E%0A%3C%2Fsvg%3E%0A")` }}>
                        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 45 39">
                          <g id="ticket 2">
                            <path d="M8.85417 0C3.96354 0 0 3.96354 0 8.85417V14.1667C0 14.9089 0.523438 15.5495 1.2526 15.6979C2.91406 16.0365 4.16667 17.5078 4.16667 19.2708C4.16667 21.0339 2.91406 22.5052 1.2526 22.8438C0.523438 22.9922 0 23.6328 0 24.375V29.6875C0 34.5781 3.96354 38.5417 8.85417 38.5417H35.9375C40.8281 38.5417 44.7917 34.5781 44.7917 29.6875V24.375C44.7917 23.6328 44.2682 22.9922 43.5391 22.8438C41.8776 22.5052 40.625 21.0339 40.625 19.2708C40.625 17.5078 41.8776 16.0365 43.5391 15.6979C44.2682 15.5495 44.7917 14.9089 44.7917 14.1667V8.85417C44.7917 3.96354 40.8281 0 35.9375 0H8.85417Z" fill="var(--fill-0, #2D68FF)" id="Vector 298" opacity="0.4" />
                            <path clipRule="evenodd" d="M30.2083 1.58946e-07V9.3099C30.2083 10.1719 29.5078 10.8724 28.6458 10.8724C27.7839 10.8724 27.0833 10.1719 27.0833 9.3099V1.58946e-07H30.2083ZM28.6458 14.388C29.5078 14.388 30.2083 15.0885 30.2083 15.9505V22.5911C30.2083 23.4531 29.5078 24.1536 28.6458 24.1536C27.7839 24.1536 27.0833 23.4531 27.0833 22.5911V15.9505C27.0833 15.0885 27.7839 14.388 28.6458 14.388ZM28.6458 27.6693C29.5078 27.6693 30.2083 28.3698 30.2083 29.2318V38.5417H27.0833V29.2318C27.0833 28.3698 27.7839 27.6693 28.6458 27.6693Z" fill="var(--fill-0, #2D68FF)" fillRule="evenodd" id="Vector 299" />
                          </g>
                        </svg>
                      </div>
                    </div>
                  </div>
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
              className="bg-[#f6dfed] box-border content-stretch flex items-center justify-between px-[30px] py-[40px] relative rounded-[10px] shrink-0 w-[580px]"
            >
              <div className="content-stretch flex gap-[40px] items-center relative shrink-0">
                  {/* 아이콘 */}
                <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
                  <div className="[grid-area:1_/_1] ml-0 mt-0 relative size-[90px]">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 90 90">
                      <circle cx="45" cy="45" fill="var(--fill-0, white)" id="Ellipse 3" r="45" />
                    </svg>
                  </div>
                  <div className="[grid-area:1_/_1] grid-cols-[max-content] grid-rows-[max-content] inline-grid ml-[22.222%] mt-[22.222%] place-items-start relative">
                    <div className="[grid-area:1_/_1] grid-cols-[max-content] grid-rows-[max-content] inline-grid ml-[5.208%] mt-[5.215%] place-items-start relative">
                      <div className="[grid-area:1_/_1] h-[44.794px] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-2.604px_-2.607px] mask-size-[50px_50px] ml-0 mt-0 relative w-[44.792px]" style={{ maskImage: `url("data:image/svg+xml,%3Csvg%20preserveAspectRatio%3D%22none%22%20width%3D%22100%25%22%20height%3D%22100%25%22%20overflow%3D%22visible%22%20style%3D%22display%3A%20block%3B%22%20viewBox%3D%220%200%2050%2050%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%0A%3Cg%20id%3D%22clippath%22%3E%0A%3Cpath%20id%3D%22Vector%22%20d%3D%22M50%200H0V50H50V0Z%22%20fill%3D%22var(--fill-0%2C%20black)%22%2F%3E%0A%3C%2Fg%3E%0A%3C%2Fsvg%3E%0A")` }}>
                        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 45 45">
                          <g id="receipt-1 2">
                            <path d="M23.7135 0.697348C22.263 -0.357339 20.2578 -0.201089 18.9896 1.06714L17.4271 2.62964C17.237 2.81974 16.9323 2.83537 16.7266 2.66089L15.3542 1.52026C12.9792 -0.458902 9.375 1.2286 9.375 4.31974V38.0177C9.375 43.226 7.74219 44.7885 5.72917 44.7885H35.9427C40.8333 44.7885 44.7917 40.8223 44.7917 35.9343V4.31974C44.7917 1.2286 41.1875 -0.458902 38.8125 1.51766L37.4401 2.66089C37.2344 2.83537 36.9297 2.81974 36.7396 2.62964L35.1771 1.06714C33.9089 -0.201089 31.9036 -0.357339 30.4531 0.697348L27.3906 2.92651C27.2083 3.05933 26.9583 3.05933 26.776 2.92651L23.7135 0.697348Z" fill="var(--fill-0, #F6D3E9)" id="Vector 290" />
                            <g id="Vector 291">
                              <path d="M20.8333 32.2989C19.9714 32.2989 19.2708 31.5984 19.2708 30.7364C19.2708 29.8744 19.9714 29.1739 20.8333 29.1739H33.3333C34.1953 29.1739 34.8958 29.8718 34.8958 30.7364C34.8958 31.601 34.1953 32.2989 33.3333 32.2989H20.8333Z" fill="var(--fill-0, #DA93BE)" id="Vector" />
                              <path d="M18.75 25.0098C17.888 25.0098 17.1875 24.3093 17.1875 23.4473C17.1875 22.5854 17.888 21.8848 18.75 21.8848H35.4167C36.2786 21.8848 36.9792 22.5828 36.9792 23.4473C36.9792 24.3119 36.2786 25.0098 35.4167 25.0098H18.75Z" fill="var(--fill-0, #DA93BE)" id="Vector_2" />
                              <path d="M22.9167 17.7208C22.0547 17.7208 21.3542 17.0203 21.3542 16.1583C21.3542 15.2963 22.0547 14.5958 22.9167 14.5958H31.25C32.112 14.5958 32.8125 15.2937 32.8125 16.1583C32.8125 17.0229 32.112 17.7208 31.25 17.7208H22.9167Z" fill="var(--fill-0, #DA93BE)" id="Vector_3" />
                              <path d="M2.60417 22.9239H9.375V38.0177C9.375 43.0619 7.84375 44.6869 5.91667 44.7833C2.61979 44.6114 -7.94729e-08 41.8822 -7.94729e-08 38.5437V25.5281C-7.94729e-08 24.0906 1.16667 22.9239 2.60417 22.9239Z" fill="var(--fill-0, #DA93BE)" id="Vector_4" />
                              <path d="M6.25 44.7937C6.32552 44.7937 6.40104 44.7911 6.47917 44.7885H6.02344C6.09896 44.7911 6.17448 44.7937 6.2526 44.7937H6.25Z" fill="var(--fill-0, #2D68FF)" id="Vector_5" />
                            </g>
                          </g>
                    </svg>
                      </div>
                    </div>
                  </div>
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
        <div className="h-[51px] overflow-clip relative shrink-0 w-[50px]">
          <div className="absolute bottom-[17.19%] contents left-0 right-[56.81%] top-[38.28%]">
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
        <div className="h-[52px] overflow-clip relative shrink-0 w-[60px]">
          <div className="absolute bottom-[-0.01%] contents left-0 right-[-0.01%] top-[-0.01%]">
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
