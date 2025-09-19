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

export default function CartPage() {
  const router = useRouter()
  const { showError, showSuccess } = useToast()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadCartItems()
  }, [])

  const loadCartItems = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    setCartItems(cart)
  }

  const removeCartItem = (index: number) => {
    const updatedCart = cartItems.filter((_, i) => i !== index)
    setCartItems(updatedCart)
    localStorage.setItem('cart', JSON.stringify(updatedCart))
    showSuccess('장바구니', '상품이 장바구니에서 제거되었습니다.')
  }

  const clearCart = () => {
    setCartItems([])
    localStorage.setItem('cart', '[]')
    showSuccess('장바구니', '장바구니가 비워졌습니다.')
  }

  const calculateTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.totalPrice, 0)
  }

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      showError('장바구니 오류', '장바구니가 비어있습니다.')
      return
    }

    // 장바구니 데이터를 세션 스토리지에 저장하고 결제 페이지로 이동
    sessionStorage.setItem('checkoutItems', JSON.stringify(cartItems))
    router.push('/checkout')
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UserNavigation />
        
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">장바구니가 비어있습니다</h1>
              <p className="text-gray-600 mb-8">원하는 상품을 장바구니에 추가해보세요.</p>
              <button
                onClick={() => router.push('/')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                상품 둘러보기
              </button>
            </div>
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
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">장바구니</h1>
            <button
              onClick={clearCart}
              className="text-red-600 hover:text-red-700 font-medium"
            >
              전체 삭제
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 장바구니 아이템 목록 */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item, index) => (
                <div key={index} className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {item.productName}
                      </h3>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm mb-4">
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

                      <div className="text-sm text-gray-500">
                        추가일: {new Date(item.addedAt).toLocaleDateString('ko-KR')}
                      </div>
                    </div>

                    <div className="text-right ml-4">
                      <div className="text-xl font-bold text-blue-600 mb-2">
                        {item.totalPrice.toLocaleString()}원
                      </div>
                      <button
                        onClick={() => removeCartItem(index)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 결제 요약 */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">결제 요약</h2>
                
                <div className="space-y-3 mb-6">
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

                <div className="border-t pt-4 mb-6">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>총 결제 금액</span>
                    <span className="text-blue-600">
                      {calculateTotalPrice().toLocaleString()}원
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 font-medium"
                >
                  {loading ? '처리 중...' : '주문하기'}
                </button>

                <div className="mt-4 text-center">
                  <button
                    onClick={() => router.push('/')}
                    className="text-gray-600 hover:text-gray-800 text-sm"
                  >
                    계속 쇼핑하기
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
