'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import UserNavigation from '@/components/UserNavigation'
import { useToast } from '@/contexts/ToastContext'

interface Product {
  id: number
  name: string
  description: string
  basePrice: number
  adultPrice: number
  childPrice: number
  infantPrice: number
  maxCapacity: number
  currentBookings: number
  useOptions: boolean
  category: {
    name: string
  }
  options?: ProductOption[]
}

interface ProductOption {
  id: number
  name: string
  values: ProductOptionValue[]
}

interface ProductOptionValue {
  id: number
  value: string
  price: number
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { showError } = useToast()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedOptions, setSelectedOptions] = useState<{[key: number]: number}>({})
  const [reservationData, setReservationData] = useState({
    adults: 1,
    children: 0,
    infants: 0,
    customerName: '',
    customerPhone: '',
    customerEmail: '',
  })

  useEffect(() => {
    if (params.id) {
      fetchProduct()
    }
  }, [params.id])

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${params.id}`)
      const data = await response.json()
      
      if (data.ok) {
        setProduct(data.data.product)
      } else {
        showError('상품 조회 실패', data.error || '상품 정보를 불러올 수 없습니다.')
        router.push('/')
      }
    } catch (error) {
      showError('서버 오류', '서버 오류가 발생했습니다.')
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const handleOptionChange = (optionId: number, valueId: number) => {
    setSelectedOptions(prev => ({
      ...prev,
      [optionId]: valueId
    }))
  }

  const calculateTotalPrice = () => {
    if (!product) return 0
    
    let total = 0
    
    // 기본 가격 계산
    total += reservationData.adults * product.adultPrice
    total += reservationData.children * product.childPrice
    total += reservationData.infants * product.infantPrice
    
    // 옵션 가격 추가
    if (product.useOptions && product.options) {
      product.options.forEach(option => {
        const selectedValueId = selectedOptions[option.id]
        if (selectedValueId) {
          const selectedValue = option.values.find(v => v.id === selectedValueId)
          if (selectedValue) {
            total += selectedValue.price
          }
        }
      })
    }
    
    return total
  }

  const handleReservation = () => {
    // 필수 정보 검증
    if (!reservationData.customerName.trim()) {
      showError('입력 오류', '예약자명을 입력해주세요.')
      return
    }
    if (!reservationData.customerPhone.trim()) {
      showError('입력 오류', '연락처를 입력해주세요.')
      return
    }
    if (!reservationData.customerEmail.trim()) {
      showError('입력 오류', '이메일을 입력해주세요.')
      return
    }

    // 옵션이 있는 상품인 경우 옵션 선택 검증
    if (product?.useOptions && product.options) {
      for (const option of product.options) {
        if (!selectedOptions[option.id]) {
          showError('옵션 선택 오류', `${option.name}을(를) 선택해주세요.`)
          return
        }
      }
    }

    // 예약 페이지로 이동
    const queryParams = new URLSearchParams({
      productId: product!.id.toString(),
      adults: reservationData.adults.toString(),
      children: reservationData.children.toString(),
      infants: reservationData.infants.toString(),
      customerName: reservationData.customerName,
      customerPhone: reservationData.customerPhone,
      customerEmail: reservationData.customerEmail,
      totalPrice: calculateTotalPrice().toString(),
      ...Object.keys(selectedOptions).reduce((acc, key) => {
        acc[`option_${key}`] = selectedOptions[parseInt(key)].toString()
        return acc
      }, {} as Record<string, string>)
    })

    router.push(`/reservation?${queryParams.toString()}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <UserNavigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">상품 정보를 불러오는 중...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <UserNavigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-gray-600">상품을 찾을 수 없습니다.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <UserNavigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* 상품 정보 */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded">
                {product.category.name}
              </span>
              <span className="text-sm text-gray-500">
                최대 {product.maxCapacity}명 | 현재 예약 {product.currentBookings}명
              </span>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
            <p className="text-gray-600 mb-6">{product.description}</p>
            
            {/* 가격 정보 */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">성인</div>
                <div className="text-lg font-semibold text-gray-900">
                  {product.adultPrice.toLocaleString()}원
                </div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">어린이</div>
                <div className="text-lg font-semibold text-gray-900">
                  {product.childPrice.toLocaleString()}원
                </div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">유아</div>
                <div className="text-lg font-semibold text-gray-900">
                  {product.infantPrice.toLocaleString()}원
                </div>
              </div>
            </div>
          </div>

          {/* 옵션 선택 */}
          {product.useOptions && product.options && product.options.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">옵션 선택</h2>
              {product.options.map((option) => (
                <div key={option.id} className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {option.name}
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {option.values.map((value) => (
                      <button
                        key={value.id}
                        onClick={() => handleOptionChange(option.id, value.id)}
                        className={`p-3 text-left border rounded-lg transition-colors ${
                          selectedOptions[option.id] === value.id
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <div className="font-medium">{value.value}</div>
                        {value.price > 0 && (
                          <div className="text-sm text-gray-600">
                            +{value.price.toLocaleString()}원
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 예약 정보 입력 */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">예약 정보</h2>
            
            {/* 인원 수 선택 */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">인원 수</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">성인</label>
                  <input
                    type="number"
                    min="0"
                    value={reservationData.adults}
                    onChange={(e) => setReservationData(prev => ({
                      ...prev,
                      adults: Math.max(0, parseInt(e.target.value) || 0)
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">어린이</label>
                  <input
                    type="number"
                    min="0"
                    value={reservationData.children}
                    onChange={(e) => setReservationData(prev => ({
                      ...prev,
                      children: Math.max(0, parseInt(e.target.value) || 0)
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">유아</label>
                  <input
                    type="number"
                    min="0"
                    value={reservationData.infants}
                    onChange={(e) => setReservationData(prev => ({
                      ...prev,
                      infants: Math.max(0, parseInt(e.target.value) || 0)
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* 예약자 정보 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">예약자명</label>
                <input
                  type="text"
                  value={reservationData.customerName}
                  onChange={(e) => setReservationData(prev => ({
                    ...prev,
                    customerName: e.target.value
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="예약자명을 입력하세요"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">연락처</label>
                <input
                  type="tel"
                  value={reservationData.customerPhone}
                  onChange={(e) => setReservationData(prev => ({
                    ...prev,
                    customerPhone: e.target.value
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="연락처를 입력하세요"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
                <input
                  type="email"
                  value={reservationData.customerEmail}
                  onChange={(e) => setReservationData(prev => ({
                    ...prev,
                    customerEmail: e.target.value
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="이메일을 입력하세요"
                />
              </div>
            </div>
          </div>

          {/* 예약 요약 및 결제 버튼 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">예약 요약</h2>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>성인 {reservationData.adults}명</span>
                <span>{(reservationData.adults * product.adultPrice).toLocaleString()}원</span>
              </div>
              {reservationData.children > 0 && (
                <div className="flex justify-between">
                  <span>어린이 {reservationData.children}명</span>
                  <span>{(reservationData.children * product.childPrice).toLocaleString()}원</span>
                </div>
              )}
              {reservationData.infants > 0 && (
                <div className="flex justify-between">
                  <span>유아 {reservationData.infants}명</span>
                  <span>{(reservationData.infants * product.infantPrice).toLocaleString()}원</span>
                </div>
              )}
              
              {/* 옵션 가격 */}
              {product.useOptions && product.options && Object.keys(selectedOptions).length > 0 && (
                <>
                  {product.options.map((option) => {
                    const selectedValueId = selectedOptions[option.id]
                    if (selectedValueId) {
                      const selectedValue = option.values.find(v => v.id === selectedValueId)
                      if (selectedValue && selectedValue.price > 0) {
                        return (
                          <div key={option.id} className="flex justify-between">
                            <span>{option.name}: {selectedValue.value}</span>
                            <span>+{selectedValue.price.toLocaleString()}원</span>
                          </div>
                        )
                      }
                    }
                    return null
                  })}
                </>
              )}
            </div>
            
            <div className="border-t pt-4">
              <div className="flex justify-between text-lg font-semibold">
                <span>총 결제 금액</span>
                <span className="text-blue-600">{calculateTotalPrice().toLocaleString()}원</span>
              </div>
            </div>
            
            <button
              onClick={handleReservation}
              className="w-full mt-6 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg font-medium"
            >
              예약하기
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
