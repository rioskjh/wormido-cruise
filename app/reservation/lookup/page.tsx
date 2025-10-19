'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import UserNavigation from '@/components/UserNavigation'
import Footer from '@/components/Footer'

export default function ReservationLookupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [orderNumber, setOrderNumber] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [autoQueried, setAutoQueried] = useState(false)

  const performLookup = async (ord: string, name: string) => {
    if (!ord.trim() || !name.trim()) {
      setError('예약번호와 예약자명을 모두 입력해주세요.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`/api/reservations/detail?orderNumber=${encodeURIComponent(ord)}&customerName=${encodeURIComponent(name)}`)
      const data = await response.json()

      if (data.ok) {
        // 예약 상세 페이지로 이동 (향후 구현)
        alert('예약 조회 기능은 준비 중입니다.')
      } else {
        setError(data.error || '예약 정보를 찾을 수 없습니다.')
      }
    } catch (error) {
      setError('서버 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const o = searchParams.get('orderNumber')
    const n = searchParams.get('customerName')
    if (o) setOrderNumber(o)
    if (n) setCustomerName(n)
    if (o && n && !autoQueried) {
      setAutoQueried(true)
      performLookup(o, n)
    }
  }, [searchParams, autoQueried])

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault()
    performLookup(orderNumber, customerName)
  }

  return (
    <div className="min-h-screen bg-white">
      <UserNavigation />

      {/* Visual Banner */}
      <div className="relative h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="/images/reservation-complete/aeefcb7185f8ec781f75ece941d96ec57ad9dad5.png" 
            alt="예약조회 배너" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40" />
        </div>
        <h1 className="relative z-10 text-white text-5xl font-bold">예약조회</h1>
      </div>

      {/* Breadcrumb */}
      <div className="bg-gray-50 py-5">
        <div className="container mx-auto px-4" style={{ maxWidth: '1200px' }}>
          <div className="flex items-center gap-2 text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-gray-400">&gt;</span>
            <span>예약조회</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16" style={{ maxWidth: '1200px' }}>
        <div className="max-w-md mx-auto">
          <div className="bg-white border border-gray-200 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">예약 조회</h2>
            
            <form onSubmit={handleLookup} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  예약번호
                </label>
                <input
                  type="text"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="예약번호를 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  예약자명
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="예약자명을 입력하세요"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 font-semibold text-lg"
              >
                {loading ? '조회 중...' : '예약 조회하기'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => router.push('/')}
                className="text-gray-600 hover:text-gray-800 underline"
              >
                메인으로 돌아가기
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}
