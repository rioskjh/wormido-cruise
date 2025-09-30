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
          {/* Logo and Social Media */}
          <div className="content-stretch flex flex-col md:flex-row items-center justify-between relative shrink-0 w-full gap-4 md:gap-0">
            {/* Logo */}
        <div className="h-[46px] overflow-clip relative shrink-0 w-[250px]">
          <div className="absolute bottom-[17.93%] contents left-[35.98%] right-0 top-[16.72%]">
            <div className="absolute inset-[59.73%_0.03%_17.93%_36.1%]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 160 11">
                <g>
                  <path d="M2.48699 8.65403L-2.38774e-09 0.171123H0.807039H1.61408L3.1458 6.15235L4.5787 0.171123H5.17162H5.76454L7.20568 6.15235L8.72917 0.171123H9.5362H10.3432L7.86449 8.65403H7.23039H6.58805L5.17162 2.96616L3.76343 8.65403H3.12933H2.48699Z" fill="var(--fill-0, #333333)" />
                  <path d="M15.3996 6.90203C15.7537 6.51904 15.9349 6.04641 15.9349 5.47599C15.9349 4.90558 15.7537 4.43295 15.3996 4.04995C15.0372 3.66696 14.5925 3.47139 14.0655 3.47139C13.5384 3.47139 13.0938 3.66696 12.7314 4.04995C12.3773 4.43295 12.1961 4.91373 12.1961 5.47599C12.1961 6.03826 12.3773 6.51904 12.7314 6.90203C13.0938 7.27688 13.5302 7.47245 14.0655 7.47245C14.6008 7.47245 15.0455 7.27688 15.3996 6.90203ZM11.6444 7.87989C10.9773 7.21984 10.6479 6.42125 10.6479 5.47599C10.6479 4.53073 10.9773 3.73215 11.6444 3.0721C12.3114 2.41205 13.1185 2.07794 14.0655 2.07794C15.0125 2.07794 15.8278 2.41205 16.4948 3.0721C17.1619 3.73215 17.4913 4.53888 17.4913 5.47599C17.4913 6.41311 17.1619 7.21984 16.4948 7.87989C15.8278 8.53994 15.0208 8.8659 14.0655 8.8659C13.1102 8.8659 12.3114 8.53994 11.6444 7.87989Z" fill="var(--fill-0, #333333)" />
                  <path d="M18.4054 0.171123H19.1795H19.9536V8.65403H19.1795H18.4054V0.171123Z" fill="var(--fill-0, #333333)" />
                  <path d="M21.1888 2.28981H22.63V2.81948C23.0994 2.32241 23.6593 2.07794 24.3017 2.07794C25.0099 2.07794 25.6028 2.34685 26.0804 2.88467L26.1957 3.0232L26.3193 2.88467C26.8216 2.34685 27.4722 2.07794 28.271 2.07794C29.0698 2.07794 29.6874 2.32241 30.1486 2.81133C30.6097 3.30026 30.8403 3.96032 30.8403 4.79964V8.65403H29.2921V5.05226C29.2921 4.53073 29.1851 4.13959 28.9792 3.87068C28.7733 3.60177 28.4604 3.46324 28.0651 3.46324C27.6369 3.46324 27.3157 3.61807 27.1098 3.91957C26.8957 4.22108 26.7887 4.68556 26.7887 5.29672V8.64588H25.2405V5.21523C25.2405 4.64482 25.1334 4.20478 24.9193 3.90327C24.7052 3.60177 24.3923 3.45509 23.9805 3.45509C23.5688 3.45509 23.2558 3.60992 23.0499 3.91142C22.8441 4.21293 22.737 4.67741 22.737 5.28857V8.63773H21.1888V2.27351V2.28981Z" fill="var(--fill-0, #333333)" />
                  <path d="M32.0838 2.28981H33.632V8.65403H32.0838V2.28981ZM32.0838 0.171123H33.632V1.57272H32.0838V0.171123Z" fill="var(--fill-0, #333333)" />
                  <path d="M77.7802 2.28981H79.2213V2.83578C79.7154 2.33056 80.3166 2.06979 81.0083 2.06979C81.7742 2.06979 82.3753 2.32241 82.82 2.83578C83.2647 3.34101 83.4871 4.03366 83.4871 4.89743V8.64588H81.9389V5.23968C81.9389 4.66112 81.8318 4.21293 81.6095 3.91142C81.3871 3.60992 81.0742 3.45509 80.6542 3.45509C80.2095 3.45509 79.8801 3.60992 79.6578 3.91142C79.4354 4.21293 79.3201 4.67741 79.3201 5.28857V8.63773H77.7719V2.27351L77.7802 2.28981Z" fill="var(--fill-0, #333333)" />
                  <path d="M71.3898 2.28981H72.8309V2.77059L72.905 2.67281C73.1932 2.27351 73.6379 2.07794 74.2308 2.07794H74.3297V3.53658C73.8932 3.56918 73.5638 3.68326 73.3332 3.87068C73.0697 4.107 72.9297 4.46554 72.9297 4.97077V8.65403H71.3815V2.28981H71.3898Z" fill="var(--fill-0, #333333)" />
                  <path d="M144.764 8.65403V0.171123H145.555H146.354V7.19539H148.972V7.92063V8.65403H144.764Z" fill="var(--fill-0, #333333)" />
                  <path d="M141.536 7.89619V7.13835H143.076V8.74367C143.076 9.22444 142.944 9.59114 142.681 9.8519C142.417 10.1127 142.038 10.2512 141.544 10.2756V9.5015C141.882 9.45261 142.088 9.33853 142.17 9.1674C142.228 9.05332 142.244 8.88219 142.22 8.65403H141.536V7.89619Z" fill="var(--fill-0, #333333)" />
                  <path d="M134 1C140.629 1 146 5.20945 146 10.3999C146 15.5903 140.629 19.7997 134 19.7997C133.271 19.7997 132.558 19.75 131.867 19.6507C131.175 20.135 127.175 22.9247 126.796 22.9785C126.796 22.9785 126.642 23.0365 126.508 22.962C126.375 22.8875 126.4 22.6847 126.4 22.6847C126.442 22.4115 127.442 18.9926 127.625 18.3593C124.246 16.6995 122 13.7525 122 10.3957C122 5.20531 127.371 1 134 1ZM125.592 7.58942C125.217 7.58942 124.913 7.89157 124.913 8.26409C124.913 8.63661 125.217 8.93876 125.592 8.93876H126.671V13.024C126.671 13.3883 126.983 13.6822 127.363 13.6822C127.742 13.6822 128.054 13.3883 128.054 13.024V8.93876H129.133C129.508 8.93876 129.813 8.63661 129.813 8.26409C129.813 7.89157 129.508 7.58942 129.133 7.58942H125.588H125.592ZM131.458 7.58942C131.008 7.5977 130.654 7.9371 130.538 8.26823L128.883 12.5977C128.675 13.2475 128.858 13.4876 129.046 13.5745C129.179 13.6366 129.333 13.6697 129.488 13.6697C129.775 13.6697 129.996 13.5538 130.063 13.3676L130.404 12.4735H132.517L132.858 13.3634C132.925 13.5497 133.146 13.6656 133.433 13.6656C133.588 13.6656 133.738 13.6325 133.875 13.5704C134.067 13.4835 134.25 13.2434 134.038 12.5936L132.383 8.26823C132.267 7.9371 131.913 7.5977 131.458 7.58942ZM138.996 7.58942C138.613 7.58942 138.304 7.89985 138.304 8.27651V12.9826C138.304 13.3634 138.617 13.6697 138.996 13.6697C139.375 13.6697 139.688 13.3593 139.688 12.9826V11.4843L139.929 11.2442L141.55 13.38C141.683 13.5538 141.883 13.6532 142.104 13.6532C142.254 13.6532 142.4 13.6076 142.521 13.5166C142.667 13.4048 142.763 13.2434 142.788 13.0613C142.813 12.8792 142.767 12.697 142.654 12.5522L140.95 10.3088L142.529 8.74423C142.638 8.63661 142.692 8.4876 142.683 8.32618C142.675 8.16475 142.6 8.01161 142.479 7.89157C142.35 7.76326 142.175 7.68876 142.004 7.68876C141.854 7.68876 141.721 7.74257 141.621 7.8419L139.692 9.76244V8.28479C139.692 7.90399 139.379 7.5977 139 7.5977L138.996 7.58942ZM135.192 7.58942C134.804 7.58942 134.488 7.89985 134.488 8.27651V12.9454C134.488 13.2931 134.783 13.5745 135.15 13.5787H137.371C137.738 13.5787 138.033 13.2931 138.033 12.9454C138.033 12.5977 137.733 12.3163 137.371 12.3163H135.9V8.27651C135.9 7.89571 135.583 7.58942 135.192 7.58942ZM132.15 11.2566H130.767L131.458 9.30714L132.15 11.2566Z" fill="var(--fill-0, #333333)" />
                </g>
              </svg>
            </div>
            <div className="absolute bottom-[48.5%] left-[35.98%] right-0 top-[16.72%]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 161 16">
                <g>
                  <path d="M89.4575 7.1791V9.49336H87.514V0.912666H89.4575V2.17573H91.2774V3.91957H89.4575V5.4271H91.2774V7.18725H89.4575V7.1791ZM86.8799 11.4654C86.3529 11.2128 85.6364 11.0824 84.7223 11.0824C83.8082 11.0824 83.0753 11.2046 82.5483 11.4572C82.013 11.7098 81.7495 12.0439 81.7495 12.4595C81.7495 12.8751 82.013 13.2011 82.5483 13.4781C83.0835 13.747 83.8082 13.8856 84.7223 13.8856C85.6364 13.8856 86.3446 13.7552 86.8799 13.4863C87.407 13.2174 87.6705 12.8914 87.6705 12.4921C87.6705 12.0684 87.407 11.7261 86.8799 11.4654ZM80.6295 6.10345C80.9589 6.4946 81.3954 6.69017 81.9389 6.69017C82.4824 6.69017 82.9271 6.4946 83.2482 6.10345C83.5694 5.71231 83.7259 5.25598 83.7259 4.73446C83.7259 4.21293 83.5694 3.7566 83.2482 3.36546C82.9271 2.97431 82.4906 2.77874 81.9389 2.77874C81.3871 2.77874 80.9589 2.97431 80.6295 3.36546C80.3001 3.7566 80.1354 4.21293 80.1354 4.73446C80.1354 5.25598 80.3001 5.71231 80.6295 6.10345ZM80.8848 10.349C81.7659 9.77856 83.0341 9.49336 84.7059 9.49336C86.3776 9.49336 87.6622 9.77856 88.5352 10.3408C89.4081 10.9031 89.8445 11.612 89.8445 12.4677C89.8445 13.3233 89.4081 14.0159 88.5352 14.5782C87.6622 15.1405 86.3858 15.4257 84.7059 15.4257C83.0259 15.4257 81.7577 15.1486 80.8848 14.5864C80.0119 14.0241 79.5672 13.3233 79.5672 12.484C79.5672 11.6446 80.0036 10.9194 80.8848 10.349ZM79.2378 2.14314C79.9378 1.41789 80.8354 1.05934 81.9306 1.05934C83.0259 1.05934 83.907 1.41789 84.607 2.14314C85.307 2.86838 85.6529 3.73215 85.6529 4.73446C85.6529 5.73676 85.307 6.59238 84.607 7.30948C83.907 8.01842 83.0094 8.37697 81.9306 8.37697C80.8518 8.37697 79.9378 8.01842 79.2378 7.30948C78.5378 6.59238 78.1837 5.73676 78.1837 4.73446C78.1837 3.73215 78.5378 2.86838 79.2378 2.14314Z" fill="var(--fill-0, #333333)" />
                  <path d="M140.836 15.988H139.304C138.538 14.676 137.995 13.5922 137.657 12.7284C137.056 11.172 136.751 9.59114 136.751 7.97768C136.751 6.36422 137.056 4.80779 137.657 3.25137C138.003 2.355 138.555 1.27936 139.321 0.00814873H140.836C139.37 2.77874 138.646 5.43525 138.646 7.98583C138.646 10.5364 139.378 13.2255 140.836 15.9961" fill="var(--fill-0, #333333)" />
                  <path d="M157.487 0.00814873C158.237 1.26306 158.797 2.34686 159.151 3.25137C159.744 4.80779 160.04 6.38866 160.04 7.99398C160.04 9.59929 159.744 11.1802 159.151 12.7284C158.797 13.6574 158.245 14.7412 157.487 15.988H155.956C157.43 13.2011 158.163 10.5364 158.163 7.99398C158.163 5.45155 157.421 2.79504 155.956 -2.59815e-07H157.487V0.00814873Z" fill="var(--fill-0, #333333)" />
                </g>
              </svg>
            </div>
          </div>
        </div>

            {/* Social Media Icons */}
            <div className="h-[24px] relative shrink-0 w-[146px]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 146 24">
                <g>
                  <path d="M60.0157 32.6389C60.971 34.5213 61.0698 36.6155 60.4357 38.4898C59.8016 40.364 58.451 41.9774 56.5487 42.9227C54.6464 43.868 52.53 43.9657 50.636 43.3383C48.7419 42.7108 47.1113 41.3744 46.1561 39.4921C45.209 37.6097 45.102 35.5073 45.7361 33.6412C46.3702 31.767 47.7207 30.1535 49.623 29.2083C51.5253 28.263 53.6418 28.1652 55.5358 28.7927C57.4299 29.4201 59.0604 30.7565 60.0157 32.6389Z" fill="var(--fill-0, #4F1381)" />
                  <path d="M19.2439 30.4306C15.4146 32.3211 10.7618 30.7891 8.85125 26.9999C6.94072 23.2107 8.48891 18.6067 12.3182 16.7161C16.1475 14.8256 20.8003 16.3576 22.7109 20.1468C24.6214 23.936 23.0732 28.5401 19.2439 30.4306Z" fill="var(--fill-0, #501985)" />
                  <path d="M54.2759 21.2795C55.1982 23.113 55.3464 25.2072 54.6958 27.1303C54.0453 29.0534 52.6618 30.6506 50.8089 31.5633C48.956 32.4759 46.8396 32.6226 44.8961 31.9789C42.9526 31.3351 41.3386 29.9661 40.4162 28.1326C39.4939 26.2991 39.3457 24.2049 39.9963 22.2818C40.6468 20.3505 42.0303 18.7615 43.8832 17.8488C45.7361 16.9362 47.8525 16.7895 49.796 17.4332C51.7395 18.077 53.3453 19.446 54.2759 21.2795Z" fill="var(--fill-0, #4F1E86)" />
                  <path d="M27.9401 16.9117C27.2731 14.9397 27.4625 12.8455 28.3601 11.0609C29.266 9.27629 30.8389 7.8747 32.84 7.21464C34.8329 6.55459 36.9493 6.74201 38.7528 7.63023C40.5562 8.5266 41.9727 10.083 42.6397 12.0632C43.3068 14.0433 43.1256 16.1294 42.2197 17.914C41.3139 19.6986 39.7327 21.1002 37.7399 21.7603C35.7387 22.4203 33.6306 22.241 31.8271 21.3447C30.0236 20.4483 28.6072 18.8837 27.9401 16.9117Z" fill="var(--fill-0, #502388)" />
                  <path d="M54.8523 22.4122C55.7829 24.2456 55.9146 26.3399 55.2723 28.263C54.6217 30.1861 53.2465 31.7751 51.3853 32.696C49.5325 33.6168 47.416 33.7472 45.4726 33.1115C43.5291 32.4678 41.9233 31.1069 40.9927 29.2653C40.0621 27.4237 39.9221 25.3294 40.5727 23.4145C41.2233 21.4913 42.6068 19.9023 44.4597 18.9815C46.3126 18.0607 48.4372 17.9222 50.3724 18.5659C52.3159 19.2097 53.9217 20.5705 54.8523 22.4122Z" fill="var(--fill-0, #4E288B)" />
                </g>
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
