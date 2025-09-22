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

interface GroupedCartItem {
  productId: number
  productName: string
  items: CartItem[]
  totalPrice: number
  totalPersons: number
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

  const groupCartItems = (items: CartItem[]): GroupedCartItem[] => {
    const grouped = items.reduce((acc, item) => {
      const key = `${item.productId}-${JSON.stringify(item.selectedOptions)}`
      
      if (!acc[key]) {
        acc[key] = {
          productId: item.productId,
          productName: item.productName,
          items: [],
          totalPrice: 0,
          totalPersons: 0
        }
      }
      
      acc[key].items.push(item)
      acc[key].totalPrice += item.totalPrice
      acc[key].totalPersons += item.adults + item.children + item.infants
      
      return acc
    }, {} as Record<string, GroupedCartItem>)
    
    return Object.values(grouped)
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

  const removeGroupedCartItem = (groupedItem: GroupedCartItem) => {
    try {
      // 그룹에 속한 모든 아이템의 인덱스를 찾아서 제거
      const indicesToRemove = new Set<number>()
      
      groupedItem.items.forEach(groupItem => {
        cartItems.forEach((cartItem, index) => {
          if (cartItem.productId === groupItem.productId && 
              JSON.stringify(cartItem.selectedOptions) === JSON.stringify(groupItem.selectedOptions) &&
              cartItem.adults === groupItem.adults &&
              cartItem.children === groupItem.children &&
              cartItem.infants === groupItem.infants) {
            indicesToRemove.add(index)
          }
        })
      })
      
      const newCart = cartItems.filter((_, index) => !indicesToRemove.has(index))
      localStorage.setItem('cart', JSON.stringify(newCart))
      setCartItems(newCart)
      
      // 장바구니 업데이트 이벤트 발생
      window.dispatchEvent(new Event('cartUpdated'))
      
      showSuccess('상품 삭제', '선택한 상품이 장바구니에서 제거되었습니다.')
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

  const getOptionDisplayText = (selectedOptions: {[key: number]: number}) => {
    if (Object.keys(selectedOptions).length === 0) {
      return '기본 옵션'
    }
    
    // 실제로는 API에서 옵션 정보를 가져와야 하지만, 
    // 현재는 간단하게 표시
    return Object.entries(selectedOptions)
      .map(([optionId, valueId]) => `옵션 ${optionId}: ${valueId}`)
      .join(', ')
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
            // 장바구니 아이템들 (그룹화된 형태)
            <div className="space-y-6">
              {groupCartItems(cartItems).map((groupedItem, groupIndex) => (
                <div key={groupIndex} className="bg-white rounded-lg shadow-lg overflow-hidden">
                  {/* 상품 그룹 헤더 */}
                  <div className="bg-gray-50 px-6 py-4 border-b">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-semibold text-design-gray font-pretendard">
                          {groupedItem.productName}
                        </h3>
                        <p className="text-sm text-design-gray-light font-pretendard mt-1">
                          총 {groupedItem.totalPersons}명 • {groupedItem.items.length}개 항목
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-design-gray font-pretendard">
                          {groupedItem.totalPrice.toLocaleString()}원
                        </div>
                        <button
                          onClick={() => removeGroupedCartItem(groupedItem)}
                          className="text-sm text-red-500 hover:text-red-700 font-pretendard mt-1"
                        >
                          전체 삭제
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* 그룹 내 개별 아이템들 */}
                  <div className="p-6">
                    <div className="space-y-4">
                      {groupedItem.items.map((item, itemIndex) => (
                        <div key={itemIndex} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                          <div className="flex-1">
                            <div className="flex items-center gap-4 text-sm text-design-gray-light font-pretendard mb-2">
                              <span>성인: {item.adults}명</span>
                              <span>어린이: {item.children}명</span>
                              <span>유아: {item.infants}명</span>
                            </div>
                            
                            <div className="text-sm text-design-gray font-pretendard">
                              <span className="font-medium">옵션: </span>
                              <span className="text-design-gray-light">
                                {getOptionDisplayText(item.selectedOptions)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-lg font-bold text-design-gray font-pretendard">
                              {item.totalPrice.toLocaleString()}원
                            </div>
                          </div>
                        </div>
                      ))}
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