'use client'

import Link from 'next/link'
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
          {/* Logo and Social Media */}
          <div className="content-stretch flex flex-col md:flex-row items-center justify-between relative shrink-0 w-full gap-4 md:gap-0">
            {/* Logo */}
            <div className="h-[46px] overflow-clip relative shrink-0 w-[250px]">
              <div className="absolute bottom-[17.93%] contents left-[35.98%] right-0 top-[16.72%]">
                <div className="absolute inset-[59.73%_0.03%_17.93%_36.1%]">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 160 11">
                    <g>
                      <path d="M0 0h160v11H0z" fill="var(--fill-0, #333333)" />
                    </g>
                  </svg>
                </div>
                <div className="absolute bottom-[48.5%] left-[35.98%] right-0 top-[16.72%]">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 161 16">
                    <g>
                      <path d="M0 0h161v16H0z" fill="var(--fill-0, #333333)" />
                    </g>
                  </svg>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-[69.01%] top-[-0.01%]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 78 46">
                  <g>
                    <path d="M0 0h78v46H0z" fill="var(--fill-0, #941680)" />
                  </g>
                </svg>
              </div>
            </div>

            {/* Social Media Icons */}
            <div className="h-[24px] relative shrink-0 w-[146px]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 146 24">
                <g>
                  <g>
                    <path d="M0 0h24v24H0z" fill="var(--fill-0, #222222)" />
                  </g>
                  <g clipPath="url(#clip0_1_600)">
                    <path d="M0 0h18v18H0z" fill="var(--fill-0, black)" />
                  </g>
                  <path d="M0 0h24v24H0z" fill="var(--fill-0, #222222)" />
                </g>
                <defs>
                  <clipPath id="clip0_1_600">
                    <rect fill="white" height="18" transform="translate(64 3)" width="18" />
                  </clipPath>
                </defs>
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
                    <div className="h-[6.688px] relative w-[9.002px]">
                      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9 7">
                        <path d="M0 0l4.5 7L9 0H0z" fill="var(--fill-0, #666666)" />
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
    </footer>
  )
}
