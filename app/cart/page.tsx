'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import UserNavigation from '@/components/UserNavigation'
import Footer from '@/components/Footer'
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
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { showError, showSuccess } = useToast()

  useEffect(() => {
    loadCartItems()
  }, [])

  const loadCartItems = () => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]')
      setCartItems(cart)
    } catch (error) {
      console.error('Cart load error:', error)
      setCartItems([])
    } finally {
      setLoading(false)
    }
  }

  const removeCartItem = (index: number) => {
    try {
      const newCart = cartItems.filter((_, i) => i !== index)
      localStorage.setItem('cart', JSON.stringify(newCart))
      setCartItems(newCart)
      
      // 장바구니 업데이트 이벤트 발생
      window.dispatchEvent(new Event('cartUpdated'))
      
      showSuccess('상품 삭제', '상품이 장바구니에서 제거되었습니다.')
    } catch (error) {
      showError('삭제 실패', '상품 삭제 중 오류가 발생했습니다.')
    }
  }

  const clearCart = () => {
    try {
      localStorage.removeItem('cart')
      setCartItems([])
      
      // 장바구니 업데이트 이벤트 발생
      window.dispatchEvent(new Event('cartUpdated'))
      
      showSuccess('장바구니 비우기', '장바구니가 비워졌습니다.')
    } catch (error) {
      showError('오류', '장바구니 비우기 중 오류가 발생했습니다.')
    }
  }

  const calculateTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.totalPrice, 0)
  }

  const handleCheckout = () => {
    // 로그인 상태 확인
    const token = localStorage.getItem('accessToken')
    if (!token) {
      // 현재 페이지를 returnUrl로 저장하고 로그인 페이지로 이동
      const currentUrl = window.location.pathname + window.location.search
      router.push(`/login?returnUrl=${encodeURIComponent(currentUrl)}`)
      return
    }

    // 로그인된 상태라면 예약 페이지로 이동
    // 선택된 상품들을 쿼리 파라미터로 전달
    const selectedItems = cartItems.map((item, index) => ({
      index,
      productId: item.productId,
      adults: item.adults,
      children: item.children,
      infants: item.infants,
      selectedOptions: item.selectedOptions,
      totalPrice: item.totalPrice
    }))

    const queryParams = new URLSearchParams({
      cartItems: JSON.stringify(selectedItems)
    })

    router.push(`/reservation?${queryParams.toString()}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UserNavigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">장바구니를 불러오는 중...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UserNavigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* 헤더 */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-design-gray font-pretendard mb-2">장바구니</h1>
            <p className="text-design-gray-light font-pretendard">선택하신 상품들을 확인하고 예약을 진행하세요.</p>
          </div>

          {cartItems.length === 0 ? (
            // 빈 장바구니
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-design-gray font-pretendard mb-2">장바구니가 비어있습니다</h3>
              <p className="text-design-gray-light font-pretendard mb-6">상품을 선택하여 장바구니에 추가해보세요.</p>
              <Link 
                href="/"
                className="inline-block bg-design-blue text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-pretendard font-medium"
              >
                상품 둘러보기
              </Link>
            </div>
          ) : (
            // 장바구니 아이템들
            <div className="space-y-6">
              {cartItems.map((item, index) => (
                <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-design-gray font-pretendard mb-2">
                          {item.productName}
                        </h3>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-4 text-sm text-design-gray-light font-pretendard">
                            <span>성인: {item.adults}명</span>
                            <span>어린이: {item.children}명</span>
                            <span>유아: {item.infants}명</span>
                          </div>
                          
                          {Object.keys(item.selectedOptions).length > 0 && (
                            <div className="text-sm text-design-gray-light font-pretendard">
                              <span>선택된 옵션: </span>
                              {Object.entries(item.selectedOptions).map(([optionId, valueId]) => (
                                <span key={optionId} className="mr-2">
                                  옵션 {optionId}: {valueId}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <div className="text-lg font-bold text-design-gray font-pretendard">
                          {item.totalPrice.toLocaleString()}원
                        </div>
                      </div>
                      
                      <button
                        onClick={() => removeCartItem(index)}
                        className="ml-4 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        title="상품 삭제"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* 총계 및 액션 버튼 */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-design-gray font-pretendard">총 결제 금액</h2>
                  <div className="text-3xl font-bold text-design-blue font-pretendard">
                    {calculateTotalPrice().toLocaleString()}원
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <button
                    onClick={clearCart}
                    className="flex-1 bg-gray-500 text-white py-3 px-6 rounded-lg hover:bg-gray-600 transition-colors font-pretendard font-medium"
                  >
                    장바구니 비우기
                  </button>
                  <button
                    onClick={handleCheckout}
                    className="flex-1 bg-design-blue text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors font-pretendard font-medium"
                  >
                    예약하기
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  )
}