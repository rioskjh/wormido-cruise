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
      <footer className="bg-design-gray text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            <p className="mt-2 text-sm text-gray-300">로딩 중...</p>
          </div>
        </div>
      </footer>
    )
  }
  return (
    <footer className="bg-design-gray text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* 회사 정보 */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-design-blue rounded-md flex items-center justify-center">
                <span className="text-white text-lg">🚢</span>
              </div>
              <div>
                <h3 className="text-xl font-bold font-pretendard">{settings.site_title || 'Wormi Cruise'}</h3>
                <p className="text-sm text-gray-300 font-pretendard">월미도 해양관광</p>
              </div>
            </div>
            <p className="text-sm text-gray-300 font-pretendard leading-relaxed">
              {settings.site_description || '아름다운 월미도 바다에서 특별한 크루즈 경험을 제공합니다. 안전하고 편안한 여행을 위해 최선을 다하겠습니다.'}
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* 서비스 안내 */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold font-pretendard">서비스 안내</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/products" className="text-sm text-gray-300 hover:text-white transition-colors font-pretendard">
                  크루즈 상품
                </Link>
              </li>
              <li>
                <Link href="/reservation" className="text-sm text-gray-300 hover:text-white transition-colors font-pretendard">
                  예약하기
                </Link>
              </li>
              <li>
                <Link href="/events" className="text-sm text-gray-300 hover:text-white transition-colors font-pretendard">
                  이벤트
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="text-sm text-gray-300 hover:text-white transition-colors font-pretendard">
                  갤러리
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-sm text-gray-300 hover:text-white transition-colors font-pretendard">
                  고객지원
                </Link>
              </li>
            </ul>
          </div>

          {/* 고객센터 */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold font-pretendard">고객센터</h4>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium font-pretendard">전화 문의</p>
                <p className="text-sm text-gray-300 font-pretendard">{settings.customer_center_phone || '032-123-4567'}</p>
                <p className="text-xs text-gray-400 font-pretendard">{settings.customer_center_hours || '평일 09:00 - 18:00'}</p>
              </div>
              <div>
                <p className="text-sm font-medium font-pretendard">이메일</p>
                <p className="text-sm text-gray-300 font-pretendard">{settings.customer_center_email || 'info@wormicruise.com'}</p>
              </div>
              <div>
                <p className="text-sm font-medium font-pretendard">카카오톡</p>
                <p className="text-sm text-gray-300 font-pretendard">@월미도크루즈</p>
              </div>
            </div>
          </div>

          {/* 회사 정보 */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold font-pretendard">회사 정보</h4>
            <div className="space-y-2 text-sm text-gray-300 font-pretendard">
              <p>상호: {settings.company_name || '월미도해양관광(주)'}</p>
              <p>대표: {settings.company_ceo || '김크루즈'}</p>
              <p>사업자등록번호: {settings.company_registration || '123-45-67890'}</p>
              <p>주소: {settings.company_address || '인천광역시 중구 월미문화로 81'}</p>
              <p>통신판매업신고: {settings.company_telecom || '제2024-인천중구-1234호'}</p>
            </div>
          </div>
        </div>

        {/* 하단 구분선 및 저작권 */}
        <div className="border-t border-gray-600 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-300 font-pretendard">
              <p>&copy; 2024 Wormi Cruise. All rights reserved.</p>
            </div>
            <div className="flex space-x-6 text-sm">
              <Link href="/privacy" className="text-gray-300 hover:text-white transition-colors font-pretendard">
                개인정보처리방침
              </Link>
              <Link href="/terms" className="text-gray-300 hover:text-white transition-colors font-pretendard">
                이용약관
              </Link>
              <Link href="/refund" className="text-gray-300 hover:text-white transition-colors font-pretendard">
                환불정책
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
