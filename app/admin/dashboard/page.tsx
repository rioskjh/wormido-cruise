'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/AdminLayout'
import { useToast } from '@/contexts/ToastContext'

interface DashboardStats {
  totalReservations: number
  pendingReservations: number
  confirmedReservations: number
  cancelledReservations: number
  totalRevenue: number
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()
  const { showError } = useToast()

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
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      // localStorage에서 토큰 우선 확인, 없으면 쿠키에서 확인
      let adminToken = localStorage.getItem('adminToken')
      
      if (!adminToken) {
        const cookies = document.cookie.split(';')
        const accessTokenCookie = cookies.find(cookie => cookie.trim().startsWith('accessToken='))
        adminToken = accessTokenCookie ? accessTokenCookie.split('=')[1] : null
      }
      
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
      
      const response = await fetch('/api/admin/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      })

      const data = await response.json()

      if (data.ok) {
        setStats(data.data)
      } else {
        // 토큰 관련 에러인 경우 로그인 페이지로 이동
        if (data.error === 'Unauthorized' || 
            data.error === '토큰 검증 실패' || 
            data.error === '유효하지 않은 토큰입니다.' ||
            response.status === 401) {
          // 토큰 삭제 후 로그인 페이지로 이동
          localStorage.removeItem('adminToken')
          localStorage.removeItem('adminRefreshToken')
          router.push('/admin/login')
          return
        } else {
          setError(data.error || '데이터를 불러오는데 실패했습니다.')
          showError('대시보드 데이터 로드 실패', data.error || '데이터를 불러오는데 실패했습니다.')
        }
      }
    } catch (error) {
      console.error('API 호출 에러:', error)
      // 네트워크 에러나 기타 에러인 경우에도 토큰 만료 가능성 체크
      setError('데이터를 불러오는데 실패했습니다.')
      showError('대시보드 데이터 로드 실패', '데이터를 불러오는데 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <AdminLayout title="관리자 대시보드" description="Wormi Cruise 관리 시스템">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">로딩 중...</div>
        </div>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout title="관리자 대시보드" description="Wormi Cruise 관리 시스템">
        <div className="flex items-center justify-center h-64">
          <div className="text-red-600">{error}</div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="관리자 대시보드" description="Wormi Cruise 관리 시스템">
      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">📋</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    총 예약 수
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats?.totalReservations || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">⏳</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    대기 중
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats?.pendingReservations || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">✅</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    확정됨
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats?.confirmedReservations || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">💰</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    총 매출
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    ₩{stats?.totalRevenue?.toLocaleString() || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 빠른 액션 */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">빠른 액션</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/admin/reservations"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-lg">📋</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-900">예약 관리</h3>
              <p className="text-sm text-gray-500">예약 현황 확인 및 관리</p>
            </div>
          </a>

          <a
            href="/admin/products"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 text-lg">🚢</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-900">상품 관리</h3>
              <p className="text-sm text-gray-500">크루즈 상품 등록 및 관리</p>
            </div>
          </a>

          <a
            href="/admin/members"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 text-lg">👥</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-900">회원 관리</h3>
              <p className="text-sm text-gray-500">회원 정보 조회 및 관리</p>
            </div>
          </a>
        </div>
      </div>
    </AdminLayout>
  )
}