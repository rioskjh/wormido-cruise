'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Reservation {
  id: number
  orderNumber: string
  customerName: string
  customerPhone: string
  customerEmail: string
  reservationDate: string
  reservationTime: string
  adults: number
  children: number
  infants: number
  totalAmount: number
  status: string
  paymentStatus: string
  createdAt: string
  product: {
    name: string
  }
  member?: {
    username: string
    nickname: string
  }
}

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const router = useRouter()

  // 토큰 만료 확인 함수
  const isTokenExpired = (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const currentTime = Math.floor(Date.now() / 1000)
      return payload.exp < currentTime
    } catch {
      return true // 토큰 파싱 실패 시 만료된 것으로 간주
    }
  }

  // 토큰 갱신 함수
  const refreshToken = async (): Promise<string | null> => {
    try {
      const refreshTokenValue = localStorage.getItem('adminRefreshToken')
      if (!refreshTokenValue) {
        return null
      }

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: refreshTokenValue }),
      })

      const data = await response.json()
      if (data.ok) {
        localStorage.setItem('adminToken', data.data.accessToken)
        localStorage.setItem('adminRefreshToken', data.data.refreshToken)
        return data.data.accessToken
      }
      return null
    } catch (error) {
      console.error('토큰 갱신 실패:', error)
      return null
    }
  }

  useEffect(() => {
    // 관리자 인증 확인
    const adminToken = localStorage.getItem('adminToken')
    if (!adminToken) {
      router.push('/admin/login')
      return
    }

    // 토큰 만료 확인
    if (isTokenExpired(adminToken)) {
      console.log('토큰이 만료되어 갱신을 시도합니다.')
      refreshToken().then(newToken => {
        if (newToken) {
          console.log('토큰 갱신 성공')
          fetchReservations()
        } else {
          // 토큰 갱신 실패 시 로그인 페이지로 이동
          localStorage.removeItem('adminToken')
          localStorage.removeItem('adminRefreshToken')
          router.push('/admin/login')
        }
      })
    } else {
      fetchReservations()
    }
  }, [router, statusFilter])

  const fetchReservations = async () => {
    try {
      let adminToken = localStorage.getItem('adminToken')
      
      if (!adminToken) {
        router.push('/admin/login')
        return
      }

      // 토큰 만료 확인 및 갱신
      if (isTokenExpired(adminToken)) {
        console.log('토큰이 만료되어 갱신을 시도합니다.')
        const newToken = await refreshToken()
        if (newToken) {
          adminToken = newToken
          console.log('토큰 갱신 성공')
        } else {
          // 토큰 갱신 실패 시 로그인 페이지로 이동
          localStorage.removeItem('adminToken')
          localStorage.removeItem('adminRefreshToken')
          router.push('/admin/login')
          return
        }
      }

      const url = statusFilter === 'ALL' 
        ? '/api/admin/reservations'
        : `/api/admin/reservations?status=${statusFilter}`
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      })

      const data = await response.json()

      if (data.ok) {
        setReservations(data.data)
      } else {
        // 토큰 관련 에러인 경우 로그인 페이지로 이동
        if (data.error === 'Unauthorized' || 
            data.error === '토큰 검증 실패' || 
            data.error === '유효하지 않은 토큰입니다.' ||
            response.status === 401) {
          localStorage.removeItem('adminToken')
          localStorage.removeItem('adminRefreshToken')
          router.push('/admin/login')
          return
        } else {
          setError(data.error || '예약 목록을 불러오는데 실패했습니다.')
        }
      }
    } catch (error) {
      console.error('API 호출 에러:', error)
      setError('예약 목록을 불러오는데 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const updateReservationStatus = async (id: number, status: string) => {
    try {
      let adminToken = localStorage.getItem('adminToken')
      
      if (!adminToken) {
        router.push('/admin/login')
        return
      }

      // 토큰 만료 확인 및 갱신
      if (isTokenExpired(adminToken)) {
        const newToken = await refreshToken()
        if (newToken) {
          adminToken = newToken
        } else {
          localStorage.removeItem('adminToken')
          localStorage.removeItem('adminRefreshToken')
          router.push('/admin/login')
          return
        }
      }

      const response = await fetch(`/api/admin/reservations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ status }),
      })

      const data = await response.json()

      if (data.ok) {
        // 목록 새로고침
        fetchReservations()
      } else {
        // 토큰 관련 에러인 경우 로그인 페이지로 이동
        if (data.error === 'Unauthorized' || 
            data.error === '토큰 검증 실패' || 
            data.error === '유효하지 않은 토큰입니다.' ||
            response.status === 401) {
          localStorage.removeItem('adminToken')
          localStorage.removeItem('adminRefreshToken')
          router.push('/admin/login')
          return
        }
        alert(data.error || '상태 변경에 실패했습니다.')
      }
    } catch (error) {
      console.error('상태 변경 에러:', error)
      alert('상태 변경 중 오류가 발생했습니다.')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap = {
      PENDING: { label: '대기중', color: 'bg-yellow-100 text-yellow-800' },
      CONFIRMED: { label: '확정', color: 'bg-green-100 text-green-800' },
      CANCELLED: { label: '취소', color: 'bg-red-100 text-red-800' },
      COMPLETED: { label: '완료', color: 'bg-blue-100 text-blue-800' },
    }
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, color: 'bg-gray-100 text-gray-800' }
    
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusInfo.color}`}>
        {statusInfo.label}
      </span>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">예약 관리</h1>
              <p className="text-gray-600">모든 예약 현황을 확인하고 관리할 수 있습니다</p>
            </div>
            <div className="flex space-x-4">
              <a
                href="/admin/dashboard"
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                대시보드
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* 필터 */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">상태 필터:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="ALL">전체</option>
              <option value="PENDING">대기중</option>
              <option value="CONFIRMED">확정</option>
              <option value="CANCELLED">취소</option>
              <option value="COMPLETED">완료</option>
            </select>
          </div>
        </div>

        {/* 예약 목록 */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {error ? (
            <div className="p-6 text-red-600">{error}</div>
          ) : reservations.length === 0 ? (
            <div className="p-6 text-gray-500 text-center">예약이 없습니다.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      주문번호
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      고객정보
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      상품명
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      예약일시
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      인원
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      금액
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      상태
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      액션
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reservations.map((reservation) => (
                    <tr key={reservation.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {reservation.orderNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{reservation.customerName}</div>
                          <div className="text-gray-500">{reservation.customerPhone}</div>
                          <div className="text-gray-500">{reservation.customerEmail}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {reservation.product.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div>{new Date(reservation.reservationDate).toLocaleDateString()}</div>
                          <div className="text-gray-500">{reservation.reservationTime}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        성인 {reservation.adults}명, 어린이 {reservation.children}명, 유아 {reservation.infants}명
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₩{reservation.totalAmount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(reservation.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-2">
                          {reservation.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => updateReservationStatus(reservation.id, 'CONFIRMED')}
                                className="text-green-600 hover:text-green-900"
                              >
                                확정
                              </button>
                              <button
                                onClick={() => updateReservationStatus(reservation.id, 'CANCELLED')}
                                className="text-red-600 hover:text-red-900"
                              >
                                취소
                              </button>
                            </>
                          )}
                          {reservation.status === 'CONFIRMED' && (
                            <button
                              onClick={() => updateReservationStatus(reservation.id, 'COMPLETED')}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              완료
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
