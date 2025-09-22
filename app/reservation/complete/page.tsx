'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import UserNavigation from '@/components/UserNavigation'
import Footer from '@/components/Footer'
import { useToast } from '@/contexts/ToastContext'

interface ReservationInfo {
  orderNumber: string
  customerName: string
  customerPhone: string
  customerEmail: string
  totalAmount: number
  status: string
  createdAt: string
  product: {
    name: string
  }
}

function ReservationCompleteContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { showError } = useToast()
  const [reservation, setReservation] = useState<ReservationInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const orderNumber = searchParams.get('orderNumber')
    
    if (!orderNumber) {
      showError('예약 오류', '예약 번호가 없습니다.')
      router.push('/')
      return
    }

    fetchReservation(orderNumber)
  }, [searchParams, router, showError])

  const fetchReservation = async (orderNumber: string) => {
    try {
      const response = await fetch(`/api/reservations/detail?orderNumber=${orderNumber}`)
      const data = await response.json()
      
      if (data.ok) {
        setReservation(data.data.reservation)
      } else {
        showError('예약 조회 실패', data.error || '예약 정보를 불러올 수 없습니다.')
        router.push('/')
      }
    } catch (error) {
      showError('서버 오류', '서버 오류가 발생했습니다.')
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const handleGoHome = () => {
    router.push('/')
  }

  const handleViewReservations = () => {
    router.push('/reservations')
  }

  if (loading) {
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

  if (!reservation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <UserNavigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-gray-600">예약 정보를 찾을 수 없습니다.</p>
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
          {/* 성공 메시지 */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">예약이 완료되었습니다!</h1>
            <p className="text-gray-600">예약 확인서가 이메일로 발송되었습니다.</p>
          </div>

          {/* 예약 정보 카드 */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="border-b pb-4 mb-4">
              <h2 className="text-xl font-semibold text-gray-900">예약 정보</h2>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">예약 번호</span>
                <span className="font-mono font-semibold text-blue-600">{reservation.orderNumber}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">상품명</span>
                <span className="font-medium">{reservation.product.name}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">예약자명</span>
                <span className="font-medium">{reservation.customerName}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">연락처</span>
                <span className="font-medium">{reservation.customerPhone}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">이메일</span>
                <span className="font-medium">{reservation.customerEmail}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">결제 금액</span>
                <span className="font-semibold text-lg text-blue-600">
                  {reservation.totalAmount.toLocaleString()}원
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">예약 상태</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  예약 완료
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">예약 일시</span>
                <span className="font-medium">
                  {new Date(reservation.createdAt).toLocaleString('ko-KR')}
                </span>
              </div>
            </div>
          </div>

          {/* 안내 메시지 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">예약 완료 안내</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>예약 확인서가 이메일로 발송되었습니다.</li>
                    <li>예약 취소는 예약일 1일 전까지 가능합니다.</li>
                    <li>문의사항이 있으시면 고객센터로 연락해주세요.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="flex space-x-4">
            <button
              onClick={handleGoHome}
              className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              홈으로
            </button>
            <button
              onClick={handleViewReservations}
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              내 예약 보기
            </button>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  )
}

export default function ReservationCompletePage() {
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
      <ReservationCompleteContent />
    </Suspense>
  )
}
