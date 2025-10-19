'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import UserNavigation from '@/components/UserNavigation'
import Footer from '@/components/Footer'
import PageBanner from '@/components/PageBanner'
import Breadcrumb from '@/components/Breadcrumb'
import SubNavigation from '@/components/SubNavigation'
import { useToast } from '@/contexts/ToastContext'

interface ReservationData {
  orderNumber: string
  productName: string
  reservationDate: string
  reservationTime: string
  adults: number
  children: number
  infants: number
  totalAmount: number
  customerName: string
  customerPhone: string
  customerEmail: string
  representativeName: string
  representativePhone: string
  representativeEmail: string
}

function ReservationCompleteContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { showError } = useToast()
  const [reservationData, setReservationData] = useState<ReservationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [debugParams, setDebugParams] = useState<string[]>([])

  useEffect(() => {
    const loadReservationData = () => {
      const orderNumber = searchParams.get('orderNumber')
      const productName = searchParams.get('productName')
      const reservationDate = searchParams.get('reservationDate')
      const reservationTime = searchParams.get('reservationTime')
      const adults = searchParams.get('adults')
      const children = searchParams.get('children')
      const infants = searchParams.get('infants')
      const totalAmount = searchParams.get('totalAmount')
      const customerName = searchParams.get('customerName')
      const customerPhone = searchParams.get('customerPhone')
      const customerEmail = searchParams.get('customerEmail')
      const representativeName = searchParams.get('representativeName')
      const representativePhone = searchParams.get('representativePhone')
      const representativeEmail = searchParams.get('representativeEmail')
      
      if (!orderNumber) {
        showError('오류', '예약번호가 없습니다.')
        router.replace('/')
        return
      }

      // URL 파라미터에서 직접 데이터 로드
      setReservationData({
        orderNumber,
        productName: productName || '일반 유람선 투어',
        reservationDate: reservationDate || new Date().toISOString().split('T')[0],
        reservationTime: reservationTime || '11:00',
        adults: parseInt(adults || '1'),
        children: parseInt(children || '0'),
        infants: parseInt(infants || '0'),
        totalAmount: parseInt(totalAmount || '0'),
        customerName: customerName || '',
        customerPhone: customerPhone || '',
        customerEmail: customerEmail || '',
        representativeName: representativeName || '',
        representativePhone: representativePhone || '',
        representativeEmail: representativeEmail || ''
      })
      
      setLoading(false)
    }

    loadReservationData()
  }, [searchParams, router, showError])

  useEffect(() => {
    try {
      const list: string[] = []
      searchParams.forEach((value: string, key: string) => {
        list.push(`${key}=${value}`)
      })
      setDebugParams(list)
    } catch {
      setDebugParams([])
    }
  }, [searchParams])

  const handleGoToMain = () => {
    router.push('/')
  }

  const handleReservationLookup = () => {
    if (!reservationData) {
      router.push('/reservation/lookup')
      return
    }
    const q = new URLSearchParams({
      orderNumber: reservationData.orderNumber,
      customerName: reservationData.customerName,
    })
    router.push(`/reservation/lookup?${q.toString()}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <UserNavigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">예약 정보를 불러오는 중...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!reservationData) {
    return (
      <div className="min-h-screen bg-white">
        <UserNavigation />
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-lg text-gray-700">예약 정보를 불러오는데 실패했거나 유효하지 않은 예약번호입니다.</p>
          <button
            onClick={() => router.push('/')}
            className="mt-8 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
          >
            메인으로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  const totalPersons = reservationData.adults + reservationData.children + reservationData.infants

  return (
    <div className="min-h-screen bg-white">
      <UserNavigation />
      
      {/* Page Banner */}
      <PageBanner 
        title="상품예약"
        backgroundImage="/images/design-assets/aeefcb7185f8ec781f75ece941d96ec57ad9dad5.png"
      />

      {/* Sub Navigation */}
      <SubNavigation 
        items={[
          { label: '상품예약', href: '/products' },
          { label: '예약완료' }
        ]}
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16" style={{ maxWidth: '1200px' }}>
        <div className="flex flex-col items-center gap-8">

          {/* 완료 아이콘 및 메시지 */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-[142px] h-[120px]">
              <svg className="w-full h-full" fill="none" viewBox="0 0 143 120">
                <circle cx="60" cy="60" fill="white" r="59" stroke="#3C64D6" strokeWidth="2" />
                <g clipPath="url(#clip0)">
                  <path d="M32 25h55v70H32z" stroke="#3C64D6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
                  <path d="M59.5 32.6303V25.9953" stroke="#3C64D6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
                </g>
                <circle cx="117.25" cy="95" fill="#3C64D6" r="25" />
                <path d="M110 95l4 4 8-8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <defs>
                  <clipPath id="clip0">
                    <rect fill="white" height="70" transform="translate(32 25)" width="55" />
                  </clipPath>
                </defs>
              </svg>
            </div>
            <div className="text-center">
              <h2 className="text-4xl font-bold text-gray-900 mb-2">예약이 완료되었습니다!</h2>
              <p className="text-lg text-gray-600">고객님의 예약이 성공적으로 처리되었습니다.</p>
            </div>
          </div>

          {/* 예약번호 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 w-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white px-4 py-1 rounded-full border border-blue-300">
                  <span className="text-blue-600 font-semibold text-lg">예약번호</span>
                </div>
                <span className="text-blue-600 font-bold text-2xl">{reservationData.orderNumber}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span className="text-gray-700">예약번호를 꼭 기억해주세요.</span>
              </div>
            </div>
          </div>

          {/* 예약 정보 */}
          <div className="bg-white border border-gray-200 rounded-lg p-8 w-full">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200">예약 정보</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 text-lg">상품명</span>
                <span className="font-semibold text-lg">{reservationData.productName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700 text-lg">이용일시</span>
                <span className="font-semibold text-lg">{reservationData.reservationDate} {reservationData.reservationTime}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700 text-lg">인원</span>
                <span className="font-semibold text-lg">
                  총 {totalPersons}명 (대인 {reservationData.adults}명, 소인 {reservationData.children}명, 유아 {reservationData.infants}명)
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700 text-lg">결제금액</span>
                <span className="font-semibold text-lg">{reservationData.totalAmount.toLocaleString()}원</span>
              </div>
            </div>
          </div>

          {/* 예약자 정보 */}
          <div className="bg-white border border-gray-200 rounded-lg p-8 w-full">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200">예약자 정보</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">예약자명</label>
                <div className="bg-gray-100 border border-gray-300 rounded-lg px-4 py-3">
                  <span className="text-gray-900">{reservationData.customerName}</span>
                </div>
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">연락처</label>
                <div className="bg-gray-100 border border-gray-300 rounded-lg px-4 py-3">
                  <span className="text-gray-900">{reservationData.customerPhone}</span>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-gray-700 font-semibold mb-2">이메일</label>
                <div className="bg-gray-100 border border-gray-300 rounded-lg px-4 py-3">
                  <span className="text-gray-900">{reservationData.customerEmail}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 이용 안내 */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 w-full">
            <div className="flex items-center gap-3 mb-6">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900">이용 안내</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gray-600 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">예약 확인 이메일이 발송되었습니다.</span>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gray-600 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">이용 당일 예약번호를 제시해 주세요.</span>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gray-600 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">출항 30분 전까지 탑승 수속을 완료해 주세요.</span>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gray-600 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">날씨에 따라 운항이 취소될 수 있으며, 이 경우 100% 환불됩니다.</span>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gray-600 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">예약 변경 및 취소는 이용일 1일 전까지 가능합니다.</span>
              </div>
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex gap-5 w-full">
            <button
              onClick={handleGoToMain}
              className="flex-1 bg-white border-2 border-gray-300 text-gray-700 py-4 px-6 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 font-semibold text-lg"
            >
              메인으로 가기
            </button>
            <button
              onClick={handleReservationLookup}
              className="flex-1 bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-lg"
            >
              예약 조회하기
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />

      {/* Debug: received query params */}
      <div className="container mx-auto px-4 py-8">
        <div className="mt-8 bg-gray-100 border border-gray-300 rounded-lg p-4">
          <h4 className="font-semibold mb-2">Debug: Query Params</h4>
          <pre className="text-xs whitespace-pre-wrap break-words">{debugParams.join('\n')}</pre>
        </div>
      </div>
    </div>
  )
}

export default function ReservationCompletePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white">
        <UserNavigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">예약 정보를 불러오는 중...</p>
          </div>
        </div>
      </div>
    }>
      <ReservationCompleteContent />
    </Suspense>
  )
}