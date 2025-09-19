'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import UserNavigation from '@/components/UserNavigation'
import { useToast } from '@/contexts/ToastContext'

interface CartItem {
  productId: number
  productName: string
  adults: number
  children: number
  infants: number
  selectedOptions: {[key: number]: number}
  totalPrice: number
  addedAt: string
}

interface CustomerInfo {
  customerName: string
  customerPhone: string
  customerEmail: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const { showError, showSuccess } = useToast()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    customerName: '',
    customerPhone: '',
    customerEmail: ''
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadCheckoutItems()
  }, [])

  const loadCheckoutItems = () => {
    const items = JSON.parse(sessionStorage.getItem('checkoutItems') || '[]')
    if (items.length === 0) {
      showError('결제 오류', '결제할 상품이 없습니다.')
      router.push('/cart')
      return
    }
    setCartItems(items)
  }

  const calculateTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.totalPrice, 0)
  }

  const handlePayment = async () => {
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
      
      // 각 상품별로 예약 생성
      const reservations = []
      for (const item of cartItems) {
        const response = await fetch('/api/reservations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
          },
          body: JSON.stringify({
            productId: item.productId,
            adults: item.adults,
            children: item.children,
            infants: item.infants,
            customerName: customerInfo.customerName,
            customerPhone: customerInfo.customerPhone,
            customerEmail: customerInfo.customerEmail,
            totalAmount: item.totalPrice,
            selectedOptions: item.selectedOptions
          })
        })

        const data = await response.json()
        if (data.ok) {
          reservations.push(data.data.reservation)
        } else {
          throw new Error(data.error || '예약 처리 중 오류가 발생했습니다.')
        }
      }

      // 장바구니 비우기
      localStorage.setItem('cart', '[]')
      sessionStorage.removeItem('checkoutItems')

      showSuccess('결제 완료!', `${reservations.length}개의 예약이 성공적으로 완료되었습니다.`)
      
      // 첫 번째 예약의 완료 페이지로 이동
      router.push(`/reservation/complete?orderNumber=${reservations[0].orderNumber}`)
    } catch (error) {
      showError('결제 실패', error instanceof Error ? error.message : '결제 처리 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UserNavigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">결제 정보를 불러오는 중...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UserNavigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">주문/결제</h1>
            <p className="text-gray-600">주문 정보를 확인하고 결제를 진행해주세요.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 좌측: 주문 상품 목록 */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">주문 상품</h2>
              {cartItems.map((item, index) => (
                <div key={index} className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {item.productName}
                      </h3>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">대인:</span>
                          <span className="ml-1 font-medium">{item.adults}명</span>
                        </div>
                        <div>
                          <span className="text-gray-600">소인:</span>
                          <span className="ml-1 font-medium">{item.children}명</span>
                        </div>
                        <div>
                          <span className="text-gray-600">유아:</span>
                          <span className="ml-1 font-medium">{item.infants}명</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right ml-4">
                      <div className="text-xl font-bold text-blue-600">
                        {item.totalPrice.toLocaleString()}원
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 우측: 예약자 정보 및 결제 */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">예약자 정보</h2>
                
                <div className="space-y-4 mb-6">
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

                {/* 결제 요약 */}
                <div className="border-t pt-4 mb-6">
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span>상품 수</span>
                      <span>{cartItems.length}개</span>
                    </div>
                    <div className="flex justify-between">
                      <span>총 인원</span>
                      <span>
                        {cartItems.reduce((total, item) => total + item.adults + item.children + item.infants, 0)}명
                      </span>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>총 결제 금액</span>
                      <span className="text-blue-600">
                        {calculateTotalPrice().toLocaleString()}원
                      </span>
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
                    {loading ? '처리 중...' : '결제하기'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
