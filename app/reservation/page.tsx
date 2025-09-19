'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import UserNavigation from '@/components/UserNavigation'
import { useToast } from '@/contexts/ToastContext'

interface ReservationData {
  productId: number
  adults: number
  children: number
  infants: number
  customerName: string
  customerPhone: string
  customerEmail: string
  totalPrice: number
  selectedOptions: {[key: number]: number}
}

function ReservationContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { showError, showSuccess } = useToast()
  const [loading, setLoading] = useState(false)
  const [reservationData, setReservationData] = useState<ReservationData | null>(null)

  useEffect(() => {
    // URL 파라미터에서 예약 데이터 추출
    const productId = searchParams.get('productId')
    const adults = searchParams.get('adults')
    const children = searchParams.get('children')
    const infants = searchParams.get('infants')
    const customerName = searchParams.get('customerName')
    const customerPhone = searchParams.get('customerPhone')
    const customerEmail = searchParams.get('customerEmail')
    const totalPrice = searchParams.get('totalPrice')

    if (!productId || !adults || !children || !infants || !customerName || !customerPhone || !customerEmail || !totalPrice) {
      showError('예약 오류', '예약 정보가 올바르지 않습니다.')
      router.push('/')
      return
    }

    // 선택된 옵션들 추출
    const selectedOptions: {[key: number]: number} = {}
    searchParams.forEach((value, key) => {
      if (key.startsWith('option_')) {
        const optionId = parseInt(key.replace('option_', ''))
        selectedOptions[optionId] = parseInt(value)
      }
    })

    setReservationData({
      productId: parseInt(productId),
      adults: parseInt(adults),
      children: parseInt(children),
      infants: parseInt(infants),
      customerName,
      customerPhone,
      customerEmail,
      totalPrice: parseInt(totalPrice),
      selectedOptions
    })
  }, [searchParams, router, showError])

  const handlePayment = async () => {
    if (!reservationData) return

    setLoading(true)

    try {
      const token = localStorage.getItem('accessToken')
      
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          productId: reservationData.productId,
          adults: reservationData.adults,
          children: reservationData.children,
          infants: reservationData.infants,
          customerName: reservationData.customerName,
          customerPhone: reservationData.customerPhone,
          customerEmail: reservationData.customerEmail,
          totalAmount: reservationData.totalPrice,
          selectedOptions: reservationData.selectedOptions
        })
      })

      const data = await response.json()

      if (data.ok) {
        showSuccess('예약 완료!', '예약이 성공적으로 완료되었습니다.')
        
        // 예약 완료 페이지로 이동
        router.push(`/reservation/complete?orderNumber=${data.data.reservation.orderNumber}`)
      } else {
        showError('예약 실패', data.error || '예약 처리 중 오류가 발생했습니다.')
      }
    } catch (error) {
      showError('서버 오류', '서버 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  if (!reservationData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <UserNavigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">예약 확인</h1>
              <p className="text-gray-600">예약 정보를 확인하고 결제를 진행해주세요.</p>
            </div>

            {/* 예약 정보 요약 */}
            <div className="space-y-4 mb-6">
              <div className="border-b pb-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">예약자 정보</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">예약자명:</span>
                    <span className="ml-2 font-medium">{reservationData.customerName}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">연락처:</span>
                    <span className="ml-2 font-medium">{reservationData.customerPhone}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">이메일:</span>
                    <span className="ml-2 font-medium">{reservationData.customerEmail}</span>
                  </div>
                </div>
              </div>

              <div className="border-b pb-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">인원 정보</h2>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-gray-600">성인</div>
                    <div className="font-medium">{reservationData.adults}명</div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-600">어린이</div>
                    <div className="font-medium">{reservationData.children}명</div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-600">유아</div>
                    <div className="font-medium">{reservationData.infants}명</div>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">결제 정보</h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium">총 결제 금액</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {reservationData.totalPrice.toLocaleString()}원
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 결제 안내 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">결제 안내</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>현재는 테스트 모드로 실제 결제 없이 예약이 완료됩니다.</p>
                    <p>예약 완료 후 이메일로 예약 확인서가 발송됩니다.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 결제 버튼 */}
            <div className="flex space-x-4">
              <button
                onClick={() => router.back()}
                className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                이전으로
              </button>
              <button
                onClick={handlePayment}
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? '처리 중...' : '예약 완료'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ReservationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <UserNavigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">예약 정보를 불러오는 중...</p>
          </div>
        </div>
      </div>
    }>
      <ReservationContent />
    </Suspense>
  )
}
