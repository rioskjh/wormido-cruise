'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'

interface SiteSettings {
  [key: string]: string
}

export default function Footer() {
  const [settings, setSettings] = useState<SiteSettings>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings')
      const data = await response.json()
      
      if (data.ok) {
        const settingsMap: SiteSettings = {}
        data.data.settings.forEach((setting: any) => {
          settingsMap[setting.key] = setting.value
        })
        setSettings(settingsMap)
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <footer className="bg-white text-design-gray border-t border-gray-200">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-design-blue"></div>
            <p className="mt-2 text-sm text-design-gray-light">로딩 중...</p>
          </div>
        </div>
      </footer>
    )
  }

  return (
    <footer className="bg-white text-design-gray border-t border-gray-200">
      <div className="content-stretch flex flex-col gap-[10px] items-center relative size-full">
        <div aria-hidden="true" className="absolute border-[1px_0px_0px] border-black border-solid inset-0 pointer-events-none" />
        <div className="box-border content-stretch flex flex-col gap-[50px] items-start px-4 py-[50px] relative shrink-0 w-full max-w-[1200px] mx-auto">
          {/* 모바일 버전 */}
          <div className="md:hidden content-stretch flex flex-col gap-[20px] items-center justify-center relative shrink-0 w-full">
            {/* SNS 아이콘들 */}
            <div className="h-[20px] relative shrink-0 w-[106px] flex items-center justify-between">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 106 20">
                <g id="sns">
                  <g id="Vector">
                    <path d="M2 2h20v20H2z" fill="#222222" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" fill="#222222" />
                    <path d="M17.5 6.5h.01" stroke="#222222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </g>
                  <g clipPath="url(#clip0_4_2965)" id="simple-icons:naver">
                    <path d="M46 3h14v14H46z" fill="black" id="Vector_2" />
                  </g>
                  <path d="M80 2C72.27 2 66 5.64 66 10c0 2.49 1.62 4.69 4.07 6.05L67 20l4.18-1.1C72.04 19.33 72.97 19.5 74 19.5c8.73 0 15-3.64 15-8S88.73 2 80 2z" fill="#222222" id="Vector_3" />
                </g>
                <defs>
                  <clipPath id="clip0_4_2965">
                    <rect fill="white" height="14" transform="translate(46 3)" width="14" />
                  </clipPath>
                </defs>
              </svg>
            </div>
            
            {/* 링크들 */}
            <div className="content-stretch flex gap-[10px] items-center justify-center relative shrink-0">
              <div className="font-['Pretendard:Regular',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#222222] text-[10px] text-nowrap">
                <p className="leading-[18px] whitespace-pre">사업자정보확인</p>
              </div>
              <div className="bg-[#d9d9d9] h-[10px] shrink-0 w-[2px]" />
              <div className="font-['Pretendard:SemiBold',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#222222] text-[10px] text-nowrap">
                <p className="leading-[18px] whitespace-pre">개인정보처리방침</p>
              </div>
              <div className="bg-[#d9d9d9] h-[10px] shrink-0 w-[2px]" />
              <div className="font-['Pretendard:Regular',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#222222] text-[10px] text-nowrap">
                <p className="leading-[18px] whitespace-pre">이용약관</p>
              </div>
            </div>
            
            {/* 회사 정보 */}
            <div className="content-center flex flex-wrap font-['Pretendard:Regular',_sans-serif] gap-[20px] items-center justify-center leading-[0] not-italic relative shrink-0 text-[#222222] text-[0px] text-nowrap w-full">
              <div className="relative shrink-0">
                <p className="leading-[18px] text-[10px] text-nowrap whitespace-pre">
                  <span className="font-['Pretendard:SemiBold',_sans-serif] not-italic">회사명 :</span>
                  <span>{` 월미도해양관광(주)`}</span>
                </p>
              </div>
              <div className="relative shrink-0">
                <p className="leading-[18px] text-[10px] text-nowrap whitespace-pre">
                  <span className="font-['Pretendard:SemiBold',_sans-serif] not-italic">대표자 :</span>
                  <span>{` 김승남`}</span>
                </p>
              </div>
              <div className="relative shrink-0">
                <p className="leading-[18px] text-[10px] text-nowrap whitespace-pre">
                  <span className="font-['Pretendard:SemiBold',_sans-serif] not-italic">사업자 등록번호 :</span>
                  <span>{` 121-86-20194`}</span>
                </p>
              </div>
              <div className="relative shrink-0">
                <p className="leading-[18px] text-[10px] text-nowrap whitespace-pre">
                  <span className="font-['Pretendard:SemiBold',_sans-serif] not-italic">통신판매신고번호 :</span>
                  <span>{` 2014-인천중구-0238`}</span>
                </p>
              </div>
              <div className="relative shrink-0">
                <p className="leading-[18px] text-[10px] text-nowrap whitespace-pre">
                  <span className="font-['Pretendard:SemiBold',_sans-serif] not-italic">주소 :</span>
                  <span>{` 인천광역시 중구 월미문화로 21 (북성동1가) 2층`}</span>
                </p>
              </div>
              <div className="relative shrink-0">
                <p className="leading-[18px] text-[10px] text-nowrap whitespace-pre">
                  <span className="font-['Pretendard:SemiBold',_sans-serif] not-italic">이메일 :</span>
                  <span>{` cho9480@hanmail.net`}</span>
                </p>
              </div>
            </div>
            
            {/* 관련 사이트 */}
            <div className="relative rounded-[4px] shrink-0 w-full">
              <div aria-hidden="true" className="absolute border border-[#dddddd] border-solid inset-0 pointer-events-none rounded-[4px]" />
              <div className="flex flex-row items-center size-full">
                <div className="box-border content-stretch flex items-center justify-between px-[20px] py-[10px] relative w-full">
                  <div className="font-['Pretendard:Regular',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#222222] text-[11px] text-nowrap">
                    <p className="leading-[20px] whitespace-pre">관련 사이트</p>
                  </div>
                  <div className="flex items-center justify-center relative shrink-0">
                    <div className="flex-none scale-y-[-100%]">
                      <div className="h-[5.202px] relative w-[7.002px]">
                        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7 6">
                          <path d="M3.5 0L7 6H0L3.5 0z" fill="#666666" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 저작권 */}
            <div className="font-['Pretendard:Regular',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#222222] text-[10px] text-nowrap">
              <p className="leading-[20px] whitespace-pre">2025 ⓒ 월미도해양관광(주). All rights reserved.</p>
            </div>
          </div>

          {/* 데스크톱 버전 */}
          <div className="hidden md:block content-stretch flex flex-col gap-[50px] items-start relative shrink-0 w-full">
            {/* Logo and Social Media */}
            <div className="content-stretch flex flex-col md:flex-row items-center justify-between relative shrink-0 w-full gap-4 md:gap-0">
              {/* Logo */}
              <div className="h-[46px] overflow-clip relative shrink-0 w-[250px]">
                <Image
                  src="/images/logo.png"
                  alt="월미도해양관광 로고"
                  width={250}
                  height={46}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Social Media Icons */}
              <div className="h-[24px] relative shrink-0 w-[140px] flex items-center justify-between">
                {/* Instagram */}
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="#333" strokeWidth="2"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" stroke="#333" strokeWidth="2"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" stroke="#333" strokeWidth="2"/>
                </svg>
                
                {/* Naver */}
                <div className="w-6 h-6 flex items-center justify-center">
                  <span className="text-[#333] font-bold text-lg">N</span>
                </div>
                
                {/* KakaoTalk */}
                <svg className="w-8 h-6" viewBox="0 0 32 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 2C8.27 2 2 5.64 2 10c0 2.49 1.62 4.69 4.07 6.05L5 20l4.18-1.1C10.04 19.33 10.97 19.5 12 19.5c8.73 0 15-3.64 15-8S24.73 2 16 2z" fill="#333"/>
                  <text x="16" y="14" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold">TALK</text>
                </svg>
              </div>
            </div>

            {/* Footer Links and Information */}
            <div className="content-stretch flex flex-col gap-[20px] items-start justify-center relative shrink-0 w-full">
              {/* Footer Links */}
              <div className="content-stretch flex gap-[16px] items-center justify-center relative shrink-0">
                <div className="font-['Pretendard:Regular',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#222222] text-[16px] text-nowrap">
                  <p className="leading-[26px] whitespace-pre">사업자정보확인</p>
                </div>
                <div className="bg-[#d9d9d9] h-[16px] shrink-0 w-[2px]" />
                <div className="font-['Pretendard:SemiBold',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#222222] text-[16px] text-nowrap">
                  <Link href="/privacy" className="hover:text-design-blue transition-colors">
                    <p className="leading-[26px] whitespace-pre">개인정보처리방침</p>
                  </Link>
                </div>
                <div className="bg-[#d9d9d9] h-[16px] shrink-0 w-[2px]" />
                <div className="font-['Pretendard:Regular',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#222222] text-[16px] text-nowrap">
                  <Link href="/terms" className="hover:text-design-blue transition-colors">
                    <p className="leading-[26px] whitespace-pre">이용약관</p>
                  </Link>
                </div>
              </div>

              {/* Company Information */}
              <div className="content-stretch flex flex-col lg:flex-row h-auto lg:h-[56px] items-center justify-between relative shrink-0 w-full gap-4 lg:gap-0">
                <div className="basis-0 content-center flex flex-wrap font-['Pretendard:Regular',_sans-serif] gap-[15px] lg:gap-[30px] grow items-center leading-[0] min-h-px min-w-px not-italic relative shrink-0 text-[#222222] text-[14px] lg:text-[16px] text-nowrap">
                  <div className="relative shrink-0">
                    <p className="leading-[26px] text-nowrap whitespace-pre">
                      <span className="font-['Pretendard:SemiBold',_sans-serif] not-italic">회사명 :</span> {settings.company_name || '월미도해양관광(주)'}
                    </p>
                  </div>
                  <div className="relative shrink-0">
                    <p className="leading-[26px] text-nowrap whitespace-pre">
                      <span className="font-['Pretendard:SemiBold',_sans-serif] not-italic">대표자 :</span> {settings.company_ceo || '김승남'}
                    </p>
                  </div>
                  <div className="relative shrink-0">
                    <p className="leading-[26px] text-nowrap whitespace-pre">
                      <span className="font-['Pretendard:SemiBold',_sans-serif] not-italic">사업자 등록번호 :</span> {settings.company_registration || '121-86-20194'}
                    </p>
                  </div>
                  <div className="relative shrink-0">
                    <p className="leading-[26px] text-nowrap whitespace-pre">
                      <span className="font-['Pretendard:SemiBold',_sans-serif] not-italic">통신판매신고번호 :</span> {settings.company_telecom || '2014-인천중구-0238'}
                    </p>
                  </div>
                  <div className="relative shrink-0">
                    <p className="leading-[26px] text-nowrap whitespace-pre">
                      <span className="font-['Pretendard:SemiBold',_sans-serif] not-italic">주소 :</span> {settings.company_address || '인천광역시 중구 월미문화로 21 (북성동1가) 2층'}
                    </p>
                  </div>
                  <div className="relative shrink-0">
                    <p className="leading-[26px] text-nowrap whitespace-pre">
                      <span className="font-['Pretendard:SemiBold',_sans-serif] not-italic">이메일 :</span> {settings.customer_center_email || 'cho9480@hanmail.net'}
                    </p>
                  </div>
                </div>

                {/* Related Sites Dropdown */}
                <div className="box-border content-stretch flex items-center justify-between px-[20px] py-[12px] relative rounded-[4px] shrink-0 w-full lg:w-[218.002px]">
                  <div aria-hidden="true" className="absolute border border-[#dddddd] border-solid inset-0 pointer-events-none rounded-[4px]" />
                  <div className="font-['Pretendard:Regular',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#222222] text-[16px] text-nowrap">
                    <p className="leading-[26px] whitespace-pre">관련 사이트</p>
                  </div>
                  <div className="flex items-center justify-center relative shrink-0">
                    <div className="flex-none scale-y-[-100%]">
                      <div className="h-[8.002px] relative w-[10.002px]">
                        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10 8">
                          <path d="M5 0L10 8H0L5 0z" fill="#666666" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Copyright */}
              <div className="font-['Pretendard:Regular',_sans-serif] h-[56px] leading-[0] not-italic relative shrink-0 text-[#222222] text-[16px] w-full">
                <p className="leading-[26px]">2025 ⓒ {settings.company_name || '월미도해양관광(주)'}. All rights reserved.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}