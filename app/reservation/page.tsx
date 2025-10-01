'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import UserNavigation from '@/components/UserNavigation'
import Footer from '@/components/Footer'
import PageBanner from '@/components/PageBanner'
import Breadcrumb from '@/components/Breadcrumb'
import SubNavigation from '@/components/SubNavigation'
import { useToast } from '@/contexts/ToastContext'

interface ReservationData {
  productId: number
  adults: number
  children: number
  infants: number
  totalPrice: number
  selectedOptions: {[key: number]: number}
}

interface CustomerInfo {
  customerName: string
  customerPhone: string
  customerEmail: string
}

function ReservationContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { showError, showSuccess } = useToast()
  const [loading, setLoading] = useState(false)
  const [reservationData, setReservationData] = useState<ReservationData | null>(null)
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    customerName: '',
    customerPhone: '',
    customerEmail: ''
  })

  useEffect(() => {
    // 장바구니 아이템이 있는지 확인
    const cartItems = searchParams.get('cartItems')
    
    if (cartItems) {
      // 장바구니에서 온 경우
      try {
        const items = JSON.parse(cartItems)
        // 첫 번째 아이템을 사용 (나중에 여러 아이템 처리 가능)
        const firstItem = items[0]
        setReservationData({
          productId: firstItem.productId,
          adults: firstItem.adults,
          children: firstItem.children,
          infants: firstItem.infants,
          totalPrice: firstItem.totalPrice,
          selectedOptions: firstItem.selectedOptions
        })
      } catch (error) {
        showError('예약 오류', '장바구니 정보가 올바르지 않습니다.')
        router.push('/cart')
        return
      }
    } else {
      // URL 파라미터에서 예약 데이터 추출
      const productId = searchParams.get('productId')
      const adults = searchParams.get('adults')
      const children = searchParams.get('children')
      const infants = searchParams.get('infants')
      const totalPrice = searchParams.get('totalPrice')

      if (!productId || !adults || !children || !infants || !totalPrice) {
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
        totalPrice: parseInt(totalPrice),
        selectedOptions
      })
    }
  }, [searchParams, router, showError])

  const handlePayment = async () => {
    if (!reservationData) return

    // 예약자 정보 검증
    if (!customerInfo.customerName.trim()) {
      showError('입력 오류', '예약자명을 입력해주세요.')
      return
    }
    if (!customerInfo.customerPhone.trim()) {
      showError('입력 오류', '연락처를 입력해주세요.')
      return
    }
    if (!customerInfo.customerEmail.trim()) {
      showError('입력 오류', '이메일을 입력해주세요.')
      return
    }

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
          customerName: customerInfo.customerName,
          customerPhone: customerInfo.customerPhone,
          customerEmail: customerInfo.customerEmail,
          totalAmount: reservationData.totalPrice,
          selectedOptions: reservationData.selectedOptions
        })
      })

      const data = await response.json()

      if (data.ok) {
        // 장바구니에서 온 예약인 경우 장바구니 비우기
        const cartItems = searchParams.get('cartItems')
        if (cartItems) {
          try {
            const items = JSON.parse(cartItems)
            const currentCart = JSON.parse(localStorage.getItem('cart') || '[]')
            // 예약된 아이템들을 장바구니에서 제거
            const updatedCart = currentCart.filter((_: any, index: number) => 
              !items.some((item: any) => item.index === index)
            )
            localStorage.setItem('cart', JSON.stringify(updatedCart))
            
            // 장바구니 업데이트 이벤트 발생
            window.dispatchEvent(new Event('cartUpdated'))
          } catch (error) {
            console.error('Cart update error:', error)
          }
        }
        
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
    <div className="min-h-screen bg-gray-50">
      <UserNavigation />
      
      {/* 페이지 배너 */}
      <PageBanner 
        title="예약하기"
        subtitle="예약자 정보를 입력하고 결제를 진행해주세요"
      />
      
      {/* 서브 네비게이션 */}
      <SubNavigation 
        items={[
          { 
            label: '상품예약', 
            href: '/products',
            children: [
              { label: '불꽃크루즈', href: '/products?category=불꽃크루즈' },
              { label: '일반크루즈', href: '/products?category=일반크루즈' },
              { label: '특별크루즈', href: '/products?category=특별크루즈' }
            ]
          },
          { 
            label: '예약하기',
            children: [
              { label: '예약확인', href: '/reservation/check' },
              { label: '예약취소', href: '/reservation/cancel' }
            ]
          }
        ]}
      />
      
      {/* 경로 네비게이션 */}
      <Breadcrumb 
        items={[
          { label: '상품예약', href: '/products' },
          { label: '예약하기' }
        ]}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 좌측: 예약 정보 요약 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">예약 정보</h2>
              
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">인원 정보</h3>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-gray-600">대인</div>
                      <div className="font-medium">{reservationData.adults}명</div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-600">소인</div>
                      <div className="font-medium">{reservationData.children}명</div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-600">유아</div>
                      <div className="font-medium">{reservationData.infants}명</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">결제 정보</h3>
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
            </div>

            {/* 우측: 예약자 정보 입력 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">예약자 정보</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    예약자명 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={customerInfo.customerName}
                    onChange={(e) => setCustomerInfo(prev => ({
                      ...prev,
                      customerName: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="예약자명을 입력하세요"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    연락처 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={customerInfo.customerPhone}
                    onChange={(e) => setCustomerInfo(prev => ({
                      ...prev,
                      customerPhone: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="연락처를 입력하세요"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이메일 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={customerInfo.customerEmail}
                    onChange={(e) => setCustomerInfo(prev => ({
                      ...prev,
                      customerEmail: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="이메일을 입력하세요"
                  />
                </div>
              </div>

              {/* 결제 안내 */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
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
              <div className="flex space-x-4 mt-6">
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
      
      {/* Footer */}
      <Footer />
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
