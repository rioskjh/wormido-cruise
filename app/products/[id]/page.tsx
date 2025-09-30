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
  detailHtml: string | null
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
    <div className="min-h-screen bg-white">
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
                    <span className="bg-[#3c64d6] text-white text-sm font-medium px-3 py-1 rounded">
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
                <div className="bg-white border border-[#42a3ff] rounded-lg shadow-[0px_3px_0px_0px_rgba(0,0,0,0.07)] p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="bg-[#3c64d6] h-[30px] w-[7px] rounded"></div>
                    <h3 className="text-[26px] font-bold text-gray-900">가격</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {/* 대인 가격 */}
                    <div className="bg-white border border-[#42a3ff] rounded-lg shadow-[0px_3px_0px_0px_rgba(0,0,0,0.07)] p-6">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[20px] font-bold text-gray-900">대인</span>
                          <span className="text-[17px] text-gray-600">(중학생 이상~)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="bg-[#3c64d6] text-white text-[18px] font-bold px-3 py-1 rounded-full">18%</div>
                          <div className="text-[24px] font-bold text-gray-900">
                            {(product.basePrice + product.adultPrice).toLocaleString()}원
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[18px] text-gray-500 line-through">
                          정상가 {(product.basePrice + product.adultPrice + 7000).toLocaleString()}원
                        </div>
                        <div className="text-[17px] font-bold text-gray-900">할인가</div>
                      </div>
                    </div>
                    
                    {/* 소인 가격 */}
                    <div className="bg-white border border-[#42a3ff] rounded-lg shadow-[0px_3px_0px_0px_rgba(0,0,0,0.07)] p-6">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[20px] font-bold text-gray-900">소인</span>
                          <span className="text-[17px] text-gray-600">(48개월 이상~중학생 미만)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="bg-[#3c64d6] text-white text-[18px] font-bold px-3 py-1 rounded-full">18%</div>
                          <div className="text-[24px] font-bold text-gray-900">
                            {(product.basePrice + product.childPrice).toLocaleString()}원
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[18px] text-gray-500 line-through">
                          정상가 {(product.basePrice + product.childPrice + 5000).toLocaleString()}원
                        </div>
                        <div className="text-[17px] font-bold text-gray-900">할인가</div>
                      </div>
                    </div>
                    
                    {/* 유아 가격 */}
                    <div className="bg-white border border-[#42a3ff] rounded-lg shadow-[0px_3px_0px_0px_rgba(0,0,0,0.07)] p-6">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[20px] font-bold text-gray-900">유아</span>
                          <span className="text-[17px] text-gray-600">(48개월 미만)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="bg-[#3c64d6] text-white text-[18px] font-bold px-3 py-1 rounded-full">18%</div>
                          <div className="text-[24px] font-bold text-gray-900">
                            {(product.basePrice + product.infantPrice).toLocaleString()}원
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[18px] text-gray-500 line-through">
                          정상가 {(product.basePrice + product.infantPrice + 3000).toLocaleString()}원
                        </div>
                        <div className="text-[17px] font-bold text-gray-900">할인가</div>
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
                <div className="bg-white border border-[#42a3ff] rounded-lg shadow-[0px_3px_0px_0px_rgba(0,0,0,0.07)] p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="bg-[#3c64d6] h-[30px] w-[7px] rounded"></div>
                    <h3 className="text-[26px] font-bold text-gray-900">인원 선택</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {/* 대인 선택 */}
                    <div className="flex items-center justify-between h-[50px]">
                      <div className="text-[16px] text-gray-900">
                        <div>대인</div>
                        <div className="font-semibold">{(product.basePrice + product.adultPrice).toLocaleString()}원</div>
                      </div>
                      <div className="flex items-center border border-[#dddddd] rounded">
                        <button 
                          onClick={() => setReservationData(prev => ({ ...prev, adults: Math.max(0, prev.adults - 1) }))}
                          className="w-[44px] h-[44px] flex items-center justify-center border-r border-[#dddddd] hover:bg-gray-50"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        <div className="w-[44px] h-[44px] flex items-center justify-center border-r border-[#dddddd]">
                          <span className="text-[16px]">{reservationData.adults}</span>
                        </div>
                        <button 
                          onClick={() => setReservationData(prev => ({ ...prev, adults: Math.min(10, prev.adults + 1) }))}
                          className="w-[44px] h-[44px] flex items-center justify-center hover:bg-gray-50"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    {/* 소인 선택 */}
                    <div className="flex items-center justify-between h-[50px]">
                      <div className="text-[16px] text-gray-900">
                        <div>소인</div>
                        <div className="font-semibold">{(product.basePrice + product.childPrice).toLocaleString()}원</div>
                      </div>
                      <div className="flex items-center border border-[#dddddd] rounded">
                        <button 
                          onClick={() => setReservationData(prev => ({ ...prev, children: Math.max(0, prev.children - 1) }))}
                          className="w-[44px] h-[44px] flex items-center justify-center border-r border-[#dddddd] hover:bg-gray-50"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        <div className="w-[44px] h-[44px] flex items-center justify-center border-r border-[#dddddd]">
                          <span className="text-[16px]">{reservationData.children}</span>
                        </div>
                        <button 
                          onClick={() => setReservationData(prev => ({ ...prev, children: Math.min(10, prev.children + 1) }))}
                          className="w-[44px] h-[44px] flex items-center justify-center hover:bg-gray-50"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    {/* 유아 선택 */}
                    <div className="flex items-center justify-between h-[50px]">
                      <div className="text-[16px] text-gray-900">
                        <div>유아(48개월 미만)</div>
                        <div className="font-semibold">{(product.basePrice + product.infantPrice).toLocaleString()}원</div>
                      </div>
                      <div className="flex items-center border border-[#dddddd] rounded">
                        <button 
                          onClick={() => setReservationData(prev => ({ ...prev, infants: Math.max(0, prev.infants - 1) }))}
                          className="w-[44px] h-[44px] flex items-center justify-center border-r border-[#dddddd] hover:bg-gray-50"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        <div className="w-[44px] h-[44px] flex items-center justify-center border-r border-[#dddddd]">
                          <span className="text-[16px]">{reservationData.infants}</span>
                        </div>
                        <button 
                          onClick={() => setReservationData(prev => ({ ...prev, infants: Math.min(3, prev.infants + 1) }))}
                          className="w-[44px] h-[44px] flex items-center justify-center hover:bg-gray-50"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </button>
                      </div>
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
                <div className="bg-[#e4f2ff] border border-[#bfdeff] rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[16px] font-semibold text-gray-900">총 가격</span>
                    <span className="text-[20px] font-bold text-gray-900">
                      {calculateTotalPrice().toLocaleString()}원
                    </span>
                  </div>
                </div>

                {/* 액션 버튼 */}
                <div className="flex gap-5">
                  <button
                    onClick={handleAddToCart}
                    className="w-[60px] h-[60px] bg-white border border-[#dddddd] rounded-lg flex items-center justify-center hover:bg-gray-50"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                    </svg>
                  </button>
                  <button
                    onClick={handleDirectReservation}
                    className="flex-1 bg-[#190a6b] text-white h-[60px] rounded-lg hover:bg-[#14085a] focus:outline-none focus:ring-2 focus:ring-[#190a6b] font-semibold text-[17px]"
                  >
                    바로구매
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 상품 상세 정보 */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* 탭 메뉴 */}
            <div className="border-b border-gray-200">
              <div className="flex">
                <button className="flex-1 py-5 px-8 text-center border-b-2 border-[#222222] bg-white">
                  <span className="text-[20px] font-semibold text-[#222222]">상품 상세 정보</span>
                </button>
                <button className="flex-1 py-5 px-8 text-center border-b border-[#dddddd] bg-white">
                  <span className="text-[20px] font-semibold text-[#666666]">상품 리뷰</span>
                </button>
                <button className="flex-1 py-5 px-8 text-center border-b border-[#dddddd] bg-white">
                  <span className="text-[20px] font-semibold text-[#666666]">상품 문의</span>
                </button>
              </div>
            </div>
            
            {/* 탭 내용 */}
            <div className="p-8">
              <div className="prose max-w-none">
                {/* 상품 상세 내용 (에디터로 작성된 내용) */}
                {product.detailHtml && (
                  <div className="mb-8">
                    <div 
                      className="prose max-w-none"
                      dangerouslySetInnerHTML={{ __html: product.detailHtml }}
                    />
                  </div>
                )}
                
                {/* 이용 안내 */}
                <div className="bg-[#190a6b] p-6 rounded-lg mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <h3 className="text-[20px] font-bold text-white">이용 전 유의사항</h3>
                  </div>
                  <ul className="space-y-3 text-white text-[17px]">
                    <li className="flex items-start gap-2">
                      <svg className="w-6 h-6 text-white mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                      <span>유람선 승선시 신분증 지참은 필수입니다. 미지참시 승선이 거부될 수도 있습니다.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-6 h-6 text-white mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                      <span>만 48개월 미만 영유아의 경우 증빙서류(등본/의료보험증)지참시 무료 승선가능 (미지참시 소아 요금 적용)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-6 h-6 text-white mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                      <span>어린 아기의 경우 청각에 예민하여 놀랄 수 있으므로 귀마개 착용하는 것을 권장드립니다.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-6 h-6 text-white mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                      <span>운항시간은 기상 및 기타사정에 의해 변경이 될 수도 있습니다.</span>
                    </li>
                  </ul>
                </div>
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

