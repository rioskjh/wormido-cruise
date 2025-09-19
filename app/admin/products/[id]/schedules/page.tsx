'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import AdminLayout from '@/components/AdminLayout'
import { useToast } from '@/contexts/ToastContext'

export const dynamic = 'force-dynamic'

interface Product {
  id: number
  name: string
  useOptions: boolean
}

interface ProductOption {
  id: number
  name: string
  sortOrder: number
  isActive: boolean
  values: ProductOptionValue[]
}

interface ProductOptionValue {
  id: number
  value: string
  price: number
  isActive: boolean
  sortOrder: number
}

interface ProductSchedule {
  id: number
  productId: number
  option1ValueId: number | null
  option2ValueId: number | null
  option3ValueId: number | null
  option1Value: ProductOptionValue | null
  option2Value: ProductOptionValue | null
  option3Value: ProductOptionValue | null
  maxCapacity: number
  currentBookings: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface ScheduleFormData {
  option1ValueId: number | null
  option2ValueId: number | null
  option3ValueId: number | null
  maxCapacity: number
  isActive: boolean
}

export default function ProductSchedulesPage() {
  const [product, setProduct] = useState<Product | null>(null)
  const [options, setOptions] = useState<ProductOption[]>([])
  const [schedules, setSchedules] = useState<ProductSchedule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<ProductSchedule | null>(null)
  const [formData, setFormData] = useState<ScheduleFormData>({
    option1ValueId: null,
    option2ValueId: null,
    option3ValueId: null,
    maxCapacity: 0,
    isActive: true
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const params = useParams()
  const { showSuccess, showError } = useToast()

  const productId = params.id as string

  // 토큰 만료 확인 함수
  const isTokenExpired = (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const currentTime = Math.floor(Date.now() / 1000)
      return payload.exp < currentTime
    } catch {
      return true
    }
  }

  // 토큰 갱신 함수
  const refreshToken = async (): Promise<string | null> => {
    try {
      const refreshToken = localStorage.getItem('adminRefreshToken')
      if (!refreshToken) return null

      const response = await fetch('/api/admin/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
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
    const checkAuth = async () => {
      const adminToken = localStorage.getItem('adminToken')
      if (!adminToken) {
        router.push('/admin/login')
        return
      }

      if (isTokenExpired(adminToken)) {
        const newToken = await refreshToken()
        if (!newToken) {
          localStorage.removeItem('adminToken')
          localStorage.removeItem('adminRefreshToken')
          router.push('/admin/login')
          return
        }
      }

      await Promise.all([fetchProduct(), fetchOptions(), fetchSchedules()])
      setIsLoading(false)
    }

    checkAuth()
  }, [router, productId])

  const fetchProduct = async () => {
    try {
      let adminToken = localStorage.getItem('adminToken')
      
      if (!adminToken) {
        router.push('/admin/login')
        return
      }

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

      const response = await fetch(`/api/admin/products/${productId}`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      })

      const data = await response.json()

      if (data.ok) {
        setProduct(data.data)
      } else {
        setError(data.error || '상품 정보를 불러오는데 실패했습니다.')
        showError('상품 정보 로드 실패', data.error || '상품 정보를 불러오는데 실패했습니다.')
      }
    } catch (error) {
      console.error('API 호출 에러:', error)
      setError('상품 정보를 불러오는데 실패했습니다.')
      showError('상품 정보 로드 실패', '상품 정보를 불러오는데 실패했습니다.')
    }
  }

  const fetchOptions = async () => {
    try {
      let adminToken = localStorage.getItem('adminToken')
      
      if (!adminToken) return

      if (isTokenExpired(adminToken)) {
        const newToken = await refreshToken()
        if (newToken) {
          adminToken = newToken
        } else {
          return
        }
      }

      const response = await fetch(`/api/admin/products/${productId}/options`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      })

      const data = await response.json()

      if (data.ok) {
        setOptions(data.data.options)
      }
    } catch (error) {
      console.error('옵션 목록 로드 에러:', error)
    }
  }

  const fetchSchedules = async () => {
    try {
      let adminToken = localStorage.getItem('adminToken')
      
      if (!adminToken) {
        router.push('/admin/login')
        return
      }

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

      const response = await fetch(`/api/admin/products/${productId}/schedules`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      })

      const data = await response.json()

      if (data.ok) {
        setSchedules(data.data)
      } else {
        setError(data.error || '스케줄 목록을 불러오는데 실패했습니다.')
        showError('스케줄 목록 로드 실패', data.error || '스케줄 목록을 불러오는데 실패했습니다.')
      }
    } catch (error) {
      console.error('API 호출 에러:', error)
      setError('스케줄 목록을 불러오는데 실패했습니다.')
      showError('스케줄 목록 로드 실패', '스케줄 목록을 불러오는데 실패했습니다.')
    }
  }

  const handleCreateSchedule = () => {
    setEditingSchedule(null)
    setFormData({
      option1ValueId: null,
      option2ValueId: null,
      option3ValueId: null,
      maxCapacity: 0,
      isActive: true
    })
    setIsModalOpen(true)
  }

  const handleEditSchedule = (schedule: ProductSchedule) => {
    setEditingSchedule(schedule)
    setFormData({
      option1ValueId: schedule.option1ValueId,
      option2ValueId: schedule.option2ValueId,
      option3ValueId: schedule.option3ValueId,
      maxCapacity: schedule.maxCapacity,
      isActive: schedule.isActive
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      let adminToken = localStorage.getItem('adminToken')
      
      if (!adminToken) {
        router.push('/admin/login')
        return
      }

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

      const url = editingSchedule 
        ? `/api/admin/products/${productId}/schedules/${editingSchedule.id}`
        : `/api/admin/products/${productId}/schedules`
      
      const method = editingSchedule ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.ok) {
        setIsModalOpen(false)
        fetchSchedules()
        if (editingSchedule) {
          showSuccess('스케줄 수정 완료', '스케줄이 성공적으로 수정되었습니다.')
        } else {
          showSuccess('스케줄 생성 완료', '새 스케줄이 성공적으로 생성되었습니다.')
        }
      } else {
        showError('스케줄 저장 실패', data.error || '스케줄 저장에 실패했습니다.')
      }
    } catch (error) {
      console.error('스케줄 저장 에러:', error)
      showError('스케줄 저장 실패', '스케줄 저장 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteSchedule = async (schedule: ProductSchedule) => {
    if (!confirm('이 스케줄을 삭제하시겠습니까?')) {
      return
    }

    try {
      let adminToken = localStorage.getItem('adminToken')
      
      if (!adminToken) {
        router.push('/admin/login')
        return
      }

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

      const response = await fetch(`/api/admin/products/${productId}/schedules/${schedule.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      })

      const data = await response.json()

      if (data.ok) {
        fetchSchedules()
        showSuccess('스케줄 삭제 완료', '스케줄이 성공적으로 삭제되었습니다.')
      } else {
        showError('스케줄 삭제 실패', data.error || '스케줄 삭제에 실패했습니다.')
      }
    } catch (error) {
      console.error('스케줄 삭제 에러:', error)
      showError('스케줄 삭제 실패', '스케줄 삭제 중 오류가 발생했습니다.')
    }
  }

  const getScheduleDescription = (schedule: ProductSchedule) => {
    const parts = []
    if (schedule.option1Value) parts.push(schedule.option1Value.value)
    if (schedule.option2Value) parts.push(schedule.option2Value.value)
    if (schedule.option3Value) parts.push(schedule.option3Value.value)
    return parts.join(' - ')
  }

  if (isLoading) {
    return (
      <AdminLayout title="상품 스케줄 관리" description="상품의 옵션 조합별 스케줄을 관리할 수 있습니다">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">로딩 중...</div>
        </div>
      </AdminLayout>
    )
  }

  if (!product) {
    return (
      <AdminLayout title="상품 스케줄 관리" description="상품의 옵션 조합별 스케줄을 관리할 수 있습니다">
        <div className="text-center py-8">
          <div className="text-red-600">상품을 찾을 수 없습니다.</div>
        </div>
      </AdminLayout>
    )
  }

  if (!product.useOptions) {
    return (
      <AdminLayout title="상품 스케줄 관리" description="상품의 옵션 조합별 스케줄을 관리할 수 있습니다">
        <div className="text-center py-8">
          <div className="text-gray-600 mb-4">이 상품은 옵션을 사용하지 않습니다.</div>
          <button
            onClick={() => router.push('/admin/products')}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            상품 목록으로 돌아가기
          </button>
        </div>
      </AdminLayout>
    )
  }

  if (options.length === 0) {
    return (
      <AdminLayout title="상품 스케줄 관리" description="상품의 옵션 조합별 스케줄을 관리할 수 있습니다">
        <div className="text-center py-8">
          <div className="text-gray-600 mb-4">먼저 옵션을 설정해주세요.</div>
          <button
            onClick={() => router.push(`/admin/products/${productId}/options`)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            옵션 관리로 이동
          </button>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="상품 스케줄 관리" description={`${product.name}의 옵션 조합별 스케줄을 관리할 수 있습니다`}>
      <div className="space-y-6">
        {/* 상품 정보 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">{product.name}</h2>
              <p className="text-gray-600">옵션 조합별 스케줄 관리</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => router.push(`/admin/products/${productId}/options`)}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                옵션 관리
              </button>
              <button
                onClick={() => router.push('/admin/products')}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                상품 목록으로
              </button>
            </div>
          </div>
        </div>

        {/* 스케줄 목록 */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium text-gray-800">스케줄 목록</h3>
                <p className="text-sm text-gray-500 mt-1">
                  옵션 조합별 수용인원 및 예약 현황 관리
                </p>
              </div>
              <button
                onClick={handleCreateSchedule}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                새 스케줄 추가
              </button>
            </div>
          </div>

          <div className="p-6">
            {schedules.length === 0 ? (
              <div className="text-center py-12">
                <div className="mb-6">
                  <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">스케줄이 없습니다</h3>
                  <p className="text-gray-500 mb-6">
                    옵션 조합별로 스케줄을 설정해보세요.<br />
                    각 옵션 조합마다 수용인원을 별도로 관리할 수 있습니다.
                  </p>
                  <button
                    onClick={handleCreateSchedule}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 font-medium"
                  >
                    첫 번째 스케줄 추가하기
                  </button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        옵션 조합
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        수용인원
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        예약수
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        상태
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        생성일
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        액션
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {schedules.map((schedule) => (
                      <tr key={schedule.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {getScheduleDescription(schedule)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {schedule.maxCapacity}명
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {schedule.currentBookings}명
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {schedule.isActive ? (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              활성
                            </span>
                          ) : (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                              비활성
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(schedule.createdAt).toLocaleDateString('ko-KR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditSchedule(schedule)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              수정
                            </button>
                            <button
                              onClick={() => handleDeleteSchedule(schedule)}
                              className="text-red-600 hover:text-red-900"
                            >
                              삭제
                            </button>
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

        {/* 스케줄 생성/수정 모달 */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-lg">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingSchedule ? '스케줄 수정' : '새 스케줄 추가'}
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-3">
                  {options.map((option, index) => (
                    <div key={option.id}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {option.name}
                      </label>
                      <select
                        value={formData[`option${index + 1}ValueId` as keyof ScheduleFormData] as number || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          [`option${index + 1}ValueId`]: e.target.value ? parseInt(e.target.value) : null
                        } as ScheduleFormData)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">선택하세요</option>
                        {option.values.map((value) => (
                          <option key={value.id} value={value.id}>
                            {value.value}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      수용인원 *
                    </label>
                    <input
                      type="number"
                      value={formData.maxCapacity}
                      onChange={(e) => setFormData({ ...formData, maxCapacity: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      min="1"
                      required
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label className="ml-2 text-sm text-gray-700">활성</label>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {isSubmitting ? '저장 중...' : '저장'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
