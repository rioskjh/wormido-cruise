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
  representativeName: string
  representativePhone: string
  representativeEmail: string
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
    customerEmail: '',
    representativeName: '',
    representativePhone: '',
    representativeEmail: ''
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
    // email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(customerInfo.customerEmail)) {
      showError('입력 오류', '올바른 이메일 형식을 입력해주세요.')
      return
    }
    
    // 대표 탑승자 정보 검증
    if (!customerInfo.representativeName.trim()) {
      showError('입력 오류', '대표 탑승자명을 입력해주세요.')
      return
    }
    if (!customerInfo.representativePhone.trim()) {
      showError('입력 오류', '대표 탑승자 연락처를 입력해주세요.')
      return
    }
    if (!customerInfo.representativeEmail.trim()) {
      showError('입력 오류', '대표 탑승자 이메일을 입력해주세요.')
      return
    }
    if (!emailRegex.test(customerInfo.representativeEmail)) {
      showError('입력 오류', '대표 탑승자 이메일 형식이 올바르지 않습니다.')
      return
    }

    // terms validation (필수 두 개 체크)
    const terms1 = (document.getElementById('terms1') as HTMLInputElement | null)?.checked
    const terms2 = (document.getElementById('terms2') as HTMLInputElement | null)?.checked
    if (!terms1 || !terms2) {
      showError('약관 동의 필요', '필수 약관에 동의해 주세요.')
      return
    }

    setLoading(true)

    try {
      // 1) 서버에서 이니시스 파라미터 생성
      const prepRes = await fetch('/api/payment/inicis/prepare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price: reservationData.totalPrice })
      })
      const prep = await prepRes.json()
      if (!prep.ok) {
        showError('결제 오류', '결제 준비에 실패했습니다.')
        setLoading(false)
        return
      }

      // 2) stdpay.js 로드 후 결제창 호출
      await new Promise<void>((resolve, reject) => {
        const existing = document.getElementById('inicis-stdpay') as HTMLScriptElement | null
        if (existing) return resolve()
        const s = document.createElement('script')
        s.id = 'inicis-stdpay'
        // Use INICIS staging stdpay script for test environment
        s.src = 'https://stgstdpay.inicis.com/stdjs/INIStdPay.js'
        s.onload = () => resolve()
        s.onerror = () => reject(new Error('stdpay.js load failed'))
        document.body.appendChild(s)
      })

      const { mid, oid, price, timestamp, signature, verification, mKey, version, currency, gopaymethod, acceptmethod, use_chkfake, returnUrl } = prep.data

      const form = document.createElement('form')
      form.id = 'SendPayForm_id'
      form.name = 'SendPayForm_id'
      form.method = 'POST'
      form.acceptCharset = 'UTF-8'

      const add = (n: string, v: string) => { const i = document.createElement('input'); i.type='hidden'; i.name=n; i.value=v; form.appendChild(i) }

      add('version', version)
      add('charset', 'UTF-8')
      add('mid', mid)
      add('goodname', '월미도 크루즈 예약')
      add('oid', oid)
      add('price', String(price))
      add('currency', currency)
      add('timestamp', timestamp)
      add('signature', signature)
      add('verification', verification)
      add('mKey', mKey)
      add('gopaymethod', gopaymethod)
      add('acceptmethod', acceptmethod)
      add('use_chkfake', use_chkfake || 'Y')
      add('returnUrl', returnUrl)

      // Buyer info
      add('buyername', customerInfo.customerName)
      add('buyertel', customerInfo.customerPhone)
      add('buyeremail', customerInfo.customerEmail)

      // Custom context to roundtrip back (merchantData)
      const merchantPayload = {
        productId: reservationData.productId,
        adults: reservationData.adults,
        children: reservationData.children,
        infants: reservationData.infants,
        totalPrice: reservationData.totalPrice,
        customerName: customerInfo.customerName,
        customerPhone: customerInfo.customerPhone,
        customerEmail: customerInfo.customerEmail,
        representativeName: customerInfo.representativeName,
        representativePhone: customerInfo.representativePhone,
        representativeEmail: customerInfo.representativeEmail,
        oid,
        // Preserve original reservation page URL params for cancel redirect
        reservationQuery: (typeof window !== 'undefined' ? window.location.search.replace(/^\?/, '') : ''),
        reservationPath: (typeof window !== 'undefined' ? (window.location.pathname + window.location.search) : '/reservation')
      }
      try {
        const md = window.btoa(unescape(encodeURIComponent(JSON.stringify(merchantPayload))))
        add('merchantData', md)
      } catch {
        // fallback plain JSON if base64 fails
        add('merchantData', JSON.stringify(merchantPayload))
      }

      document.body.appendChild(form)

      // @ts-ignore INIStdPay injected by stdpay.js
      if (typeof (window as any).INIStdPay === 'undefined') {
        showError('결제 오류', '결제 스크립트를 불러오지 못했습니다.')
        setLoading(false)
        return
      }
      // @ts-ignore
      (window as any).INIStdPay.pay('SendPayForm_id')
    } catch (e) {
      showError('결제 오류', '결제 진행 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  /*
  백업: 기존 결제 처리 로직 (예약 생성 + 테스트 모드 완료 페이지 이동)
  필요 시 아래 내용을 함수로 복구하여 사용하세요.

  const handlePaymentLegacy = async () => {
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
    
    // 대표 탑승자 정보 검증
    if (!customerInfo.representativeName.trim()) {
      showError('입력 오류', '대표 탑승자명을 입력해주세요.')
      return
    }
    if (!customerInfo.representativePhone.trim()) {
      showError('입력 오류', '대표 탑승자 연락처를 입력해주세요.')
      return
    }
    if (!customerInfo.representativeEmail.trim()) {
      showError('입력 오류', '대표 탑승자 이메일을 입력해주세요.')
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
          representativeName: customerInfo.representativeName,
          representativePhone: customerInfo.representativePhone,
          representativeEmail: customerInfo.representativeEmail,
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
        
        // 예약 완료 페이지로 이동 (모든 데이터 전달)
        const params = new URLSearchParams({
          orderNumber: data.data.reservation.orderNumber,
          productName: data.data.reservation.product?.name || '일반 유람선 투어',
          reservationDate: data.data.reservation.reservationDate || new Date().toISOString().split('T')[0],
          reservationTime: data.data.reservation.reservationTime || '11:00',
          adults: reservationData.adults.toString(),
          children: reservationData.children.toString(),
          infants: reservationData.infants.toString(),
          totalAmount: reservationData.totalPrice.toString(),
          customerName: customerInfo.customerName,
          customerPhone: customerInfo.customerPhone,
          customerEmail: customerInfo.customerEmail,
          representativeName: customerInfo.representativeName,
          representativePhone: customerInfo.representativePhone,
          representativeEmail: customerInfo.representativeEmail
        })
        
        router.push(`/reservation/complete?${params.toString()}`)
      } else {
        showError('예약 실패', data.error || '예약 처리 중 오류가 발생했습니다.')
      }
    } catch (error) {
      showError('서버 오류', '서버 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }
  */

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
    <div className="min-h-screen bg-white">
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
            href: '/products'
          },
          { 
            label: '예약하기'
          }
        ]}
      />
      
      {/* 메인 컨텐츠 - 세로 레이아웃 */}
      <div className="container mx-auto px-4 py-8" style={{ maxWidth: '1200px' }}>
        <div className="flex flex-col gap-8">
          
          {/* 섹션 1: 상품정보 */}
          <div className="bg-white border border-gray-200 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">상품정보</h2>
            
            {/* 인원 정보 */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">인원 정보</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-gray-600 text-sm">대인</div>
                  <div className="font-bold text-lg">{reservationData.adults}명</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-gray-600 text-sm">소인</div>
                  <div className="font-bold text-lg">{reservationData.children}명</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-gray-600 text-sm">유아</div>
                  <div className="font-bold text-lg">{reservationData.infants}명</div>
                </div>
              </div>
            </div>

            {/* 결제 정보 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">결제 정보</h3>
              <div className="bg-blue-50 p-6 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">총 결제 금액</span>
                  <span className="text-3xl font-bold text-blue-600">
                    {reservationData.totalPrice.toLocaleString()}원
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 섹션 2: 예약자정보 */}
          <div className="bg-white border border-gray-200 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">예약자정보</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  onChange={(e) => {
                    const sanitized = e.target.value.replace(/[^0-9\-]/g, '').slice(0, 13)
                    setCustomerInfo(prev => ({
                      ...prev,
                      customerPhone: sanitized
                    }))
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="연락처를 입력하세요"
                  inputMode="numeric"
                  pattern="^[0-9\-]{9,13}$"
                  maxLength={13}
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="이메일을 입력하세요"
                  maxLength={100}
                />
              </div>
            </div>
          </div>

          {/* 섹션 3: 탑승자정보 */}
          <div className="bg-white border border-gray-200 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">탑승자정보</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  대표 탑승자명 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={customerInfo.representativeName}
                  onChange={(e) => setCustomerInfo(prev => ({
                    ...prev,
                    representativeName: e.target.value
                  }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="대표 탑승자명을 입력하세요"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  대표 탑승자 연락처 <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={customerInfo.representativePhone}
                  onChange={(e) => {
                    const sanitized = e.target.value.replace(/[^0-9\-]/g, '').slice(0, 13)
                    setCustomerInfo(prev => ({
                      ...prev,
                      representativePhone: sanitized
                    }))
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="대표 탑승자 연락처를 입력하세요"
                  inputMode="numeric"
                  pattern="^[0-9\-]{9,13}$"
                  maxLength={13}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  대표 탑승자 이메일 <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={customerInfo.representativeEmail}
                  onChange={(e) => setCustomerInfo(prev => ({
                    ...prev,
                    representativeEmail: e.target.value
                  }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="대표 탑승자 이메일을 입력하세요"
                  maxLength={100}
                />
              </div>
            </div>
          </div>

          {/* 섹션 4: 결제정보 */}
          <div className="bg-white border border-gray-200 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">결제정보</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-blue-900">결제 안내</h3>
                  <div className="mt-2 text-blue-800">
                    <p>현재는 테스트 모드로 실제 결제 없이 예약이 완료됩니다.</p>
                    <p>예약 완료 후 이메일로 예약 확인서가 발송됩니다.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 섹션 5: 약관동의 */}
          <div className="bg-white border border-gray-200 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">약관동의</h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="terms1"
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="terms1" className="ml-3 text-sm text-gray-700">
                  <span className="font-medium">개인정보 수집 및 이용 동의</span> (필수)
                </label>
              </div>
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="terms2"
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="terms2" className="ml-3 text-sm text-gray-700">
                  <span className="font-medium">서비스 이용약관 동의</span> (필수)
                </label>
              </div>
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="terms3"
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="terms3" className="ml-3 text-sm text-gray-700">
                  <span className="font-medium">마케팅 정보 수신 동의</span> (선택)
                </label>
              </div>
            </div>
          </div>

          {/* 섹션 6: 취소/환불규정 */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8">
            <div className="flex items-center mb-6">
              <svg className="h-6 w-6 text-gray-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-2xl font-bold text-gray-900">취소/환불 규정 안내</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">이용일 3일 전까지: 100% 환불</span>
              </div>
              <div className="flex items-center">
                <svg className="h-5 w-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">이용일 2일 전: 70% 환불</span>
              </div>
              <div className="flex items-center">
                <svg className="h-5 w-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">이용일 1일 전: 50% 환불</span>
              </div>
              <div className="flex items-center">
                <svg className="h-5 w-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">이용일 당일: 환불 불가</span>
              </div>
              <div className="flex items-center">
                <svg className="h-5 w-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">천재지변으로 인한 취소 시: 100% 환불</span>
              </div>
            </div>
          </div>

          {/* 섹션 7: 버튼 */}
          <div className="flex gap-4">
            <button
              onClick={() => router.back()}
              className="flex-1 bg-white border-2 border-gray-300 text-gray-700 py-4 px-6 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 font-semibold text-lg"
            >
              이전으로
            </button>
            <button
              onClick={handlePayment}
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 font-semibold text-lg"
            >
              {loading ? '처리 중...' : '결제하기'}
            </button>
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
