'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import UserNavigation from '@/components/UserNavigation'
import Footer from '@/components/Footer'
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
  images: {
    id: number
    fileName: string
    filePath: string
    sortOrder: number
  }[]
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
  const { showError, showSuccess } = useToast()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedOptions, setSelectedOptions] = useState<{[key: number]: number}>({})
  const [reservationData, setReservationData] = useState({
    adults: 1,
    children: 0,
    infants: 0,
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
    
    // 기본 가격 계산 (상품 기본 가격 + 인원별 가격)
    total += reservationData.adults * (product.basePrice + product.adultPrice)
    total += reservationData.children * (product.basePrice + product.childPrice)
    total += reservationData.infants * (product.basePrice + product.infantPrice)
    
    // 옵션 가격 추가 (선택된 옵션의 가격을 인원 수만큼 곱함)
    if (product.useOptions && product.options) {
      product.options.forEach(option => {
        const selectedValueId = selectedOptions[option.id]
        if (selectedValueId) {
          const selectedValue = option.values.find(v => v.id === selectedValueId)
          if (selectedValue && selectedValue.price > 0) {
            // 옵션 가격을 총 인원 수만큼 곱함
            const totalPersons = reservationData.adults + reservationData.children + reservationData.infants
            total += selectedValue.price * totalPersons
          }
        }
      })
    }
    
    return total
  }

  const getSelectedOptionsPrice = () => {
    if (!product || !product.useOptions || !product.options) return []
    
    const optionsPrice: Array<{
      name: string
      value: string
      price: number
      totalPrice: number
    }> = []
    const totalPersons = reservationData.adults + reservationData.children + reservationData.infants
    
    product.options.forEach(option => {
      const selectedValueId = selectedOptions[option.id]
      if (selectedValueId) {
        const selectedValue = option.values.find(v => v.id === selectedValueId)
        if (selectedValue && selectedValue.price > 0) {
          optionsPrice.push({
            name: option.name,
            value: selectedValue.value,
            price: selectedValue.price,
            totalPrice: selectedValue.price * totalPersons
          })
        }
      }
    })
    
    return optionsPrice
  }

  const handleAddToCart = () => {
    // 옵션이 있는 상품인 경우 옵션 선택 검증
    if (product?.useOptions && product.options) {
      for (const option of product.options) {
        if (!selectedOptions[option.id]) {
          showError('옵션 선택 오류', `${option.name}을(를) 선택해주세요.`)
          return
        }
      }
    }

    // 장바구니에 추가 (로컬 스토리지 사용)
    const cartItem = {
      productId: product!.id,
      productName: product!.name,
      adults: reservationData.adults,
      children: reservationData.children,
      infants: reservationData.infants,
      selectedOptions,
      totalPrice: calculateTotalPrice(),
      addedAt: new Date().toISOString()
    }

    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]')
    existingCart.push(cartItem)
    localStorage.setItem('cart', JSON.stringify(existingCart))

    // 장바구니 업데이트 이벤트 발생
    window.dispatchEvent(new Event('cartUpdated'))

    showSuccess('장바구니 추가', '상품이 장바구니에 추가되었습니다.')
  }

  const handleDirectReservation = () => {
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
      totalPrice: calculateTotalPrice().toString(),
      ...Object.keys(selectedOptions).reduce((acc, key) => {
        acc[`option_${key}`] = selectedOptions[parseInt(key)].toString()
        return acc
      }, {} as Record<string, string>)
    })

    window.location.href = `/reservation?${queryParams.toString()}`
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
    <div className="min-h-screen bg-gray-50">
      <UserNavigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* 상품 정보 섹션 */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
              {/* 좌측: 상품 이미지 */}
              <div className="space-y-4">
                <div className="aspect-square rounded-lg overflow-hidden">
                  <Image
                    src={product.images && product.images.length > 0 
                      ? product.images[0].filePath 
                      : "/images/0279006e5653701283e6e34a07b609333312b52a.png"}
                    alt={product.name}
                    width={400}
                    height={400}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* 관련 상품 */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">관련 상품</h3>
                  <p className="text-sm text-gray-500">등록된 상품이 없습니다.</p>
                </div>
              </div>

              {/* 우측: 상품 정보 */}
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded">
                      {product.category.name}
                    </span>
                    <span className="text-sm text-gray-500">
                      최대 {product.maxCapacity}명 | 현재 예약 {product.currentBookings}명
                    </span>
                  </div>
                  
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
                  <p className="text-gray-600 text-lg leading-relaxed">{product.description}</p>
                </div>

                {/* 가격 정보 */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">가격 정보</h3>
                  <div className="space-y-3">
                    <div className="text-center p-3 bg-white rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">기본 가격</div>
                      <div className="text-lg font-bold text-gray-900">
                        {product.basePrice.toLocaleString()}원
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center p-3 bg-white rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">대인 추가</div>
                        <div className="text-lg font-bold text-gray-900">
                          +{product.adultPrice.toLocaleString()}원
                        </div>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">소인 추가</div>
                        <div className="text-lg font-bold text-gray-900">
                          +{product.childPrice.toLocaleString()}원
                        </div>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">유아 추가</div>
                        <div className="text-lg font-bold text-gray-900">
                          +{product.infantPrice.toLocaleString()}원
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 옵션 선택 */}
                {product.useOptions && product.options && product.options.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">옵션 선택</h3>
                    {product.options.map((option) => (
                      <div key={option.id} className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {option.name} <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={selectedOptions[option.id] || ''}
                          onChange={(e) => handleOptionChange(option.id, parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">선택하세요</option>
                          {option.values.map((value) => (
                            <option key={value.id} value={value.id}>
                              {value.value} {value.price > 0 && `(+${value.price.toLocaleString()}원)`}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                )}

                {/* 인원 수 선택 */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">인원 선택</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">대인</span>
                      <select
                        value={reservationData.adults}
                        onChange={(e) => setReservationData(prev => ({
                          ...prev,
                          adults: parseInt(e.target.value)
                        }))}
                        className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {Array.from({ length: 11 }, (_, i) => (
                          <option key={i} value={i}>
                            대인 {i}명 {i > 0 && `(+${(i * (product.basePrice + product.adultPrice)).toLocaleString()})`}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">소인</span>
                      <select
                        value={reservationData.children}
                        onChange={(e) => setReservationData(prev => ({
                          ...prev,
                          children: parseInt(e.target.value)
                        }))}
                        className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {Array.from({ length: 11 }, (_, i) => (
                          <option key={i} value={i}>
                            소인 {i}명 {i > 0 && `(+${(i * (product.basePrice + product.childPrice)).toLocaleString()})`}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">유아(48개월 미만)</span>
                      <select
                        value={reservationData.infants}
                        onChange={(e) => setReservationData(prev => ({
                          ...prev,
                          infants: parseInt(e.target.value)
                        }))}
                        className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {Array.from({ length: 4 }, (_, i) => (
                          <option key={i} value={i}>
                            유아 {i}명 {i > 0 && `(+${(i * (product.basePrice + product.infantPrice)).toLocaleString()})`}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* 선택된 옵션 가격 */}
                {getSelectedOptionsPrice().length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                    <h4 className="text-sm font-semibold text-yellow-800 mb-2">선택된 옵션</h4>
                    <div className="space-y-1">
                      {getSelectedOptionsPrice().map((option, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-yellow-700">
                            {option.name}: {option.value}
                          </span>
                          <span className="font-medium text-yellow-800">
                            +{option.totalPrice.toLocaleString()}원
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 총 가격 */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">총 가격</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {calculateTotalPrice().toLocaleString()}원
                    </span>
                  </div>
                </div>

                {/* 액션 버튼 */}
                <div className="flex space-x-4">
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 font-medium"
                  >
                    장바구니
                  </button>
                  <button
                    onClick={handleDirectReservation}
                    className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  >
                    바로구매
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 상품 상세 정보 */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">상품 상세 정보</h2>
            
            <div className="prose max-w-none">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">이용 안내</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• 운항시간은 기상 및 기타사정에 의해 변경이 될 수도 있습니다.</li>
                  <li>• 예약 취소는 이용일 1일 전까지 가능합니다.</li>
                  <li>• 안전을 위해 임산부, 고령자, 심장질환자는 이용에 제한이 있을 수 있습니다.</li>
                  <li>• 기상 악화 시 운항이 취소될 수 있으며, 이 경우 전액 환불됩니다.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 상품 리뷰 */}
          <div className="bg-white rounded-lg shadow-lg p-8 mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">상품 리뷰</h2>
            <div className="text-center py-8">
              <p className="text-gray-500">등록된 게시글이 없습니다.</p>
            </div>
          </div>

          {/* 상품 문의 */}
          <div className="bg-white rounded-lg shadow-lg p-8 mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">상품 문의</h2>
            <div className="text-center py-8">
              <p className="text-gray-500">등록된 게시글이 없습니다.</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  )
}

