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
  description: string | null
  isRequired: boolean
  sortOrder: number
  productId: number
  createdAt: string
  updatedAt: string
  values: ProductOptionValue[]
  _count: {
    values: number
  }
}

interface ProductOptionValue {
  id: number
  value: string
  price: number
  isActive: boolean
  sortOrder: number
  optionId: number
  createdAt: string
  updatedAt: string
}

interface OptionFormData {
  name: string
  description: string
  isRequired: boolean
  sortOrder: number
}

interface OptionValueFormData {
  value: string
  price: number
  isActive: boolean
  sortOrder: number
}

export default function ProductOptionsPage() {
  const [product, setProduct] = useState<Product | null>(null)
  const [options, setOptions] = useState<ProductOption[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isOptionModalOpen, setIsOptionModalOpen] = useState(false)
  const [isValueModalOpen, setIsValueModalOpen] = useState(false)
  const [editingOption, setEditingOption] = useState<ProductOption | null>(null)
  const [editingValue, setEditingValue] = useState<ProductOptionValue | null>(null)
  const [selectedOption, setSelectedOption] = useState<ProductOption | null>(null)
  const [optionFormData, setOptionFormData] = useState<OptionFormData>({
    name: '',
    description: '',
    isRequired: false,
    sortOrder: 0
  })
  const [valueFormData, setValueFormData] = useState<OptionValueFormData>({
    value: '',
    price: 0,
    isActive: true,
    sortOrder: 0
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

      await fetchOptions()
      setIsLoading(false)
    }

    checkAuth()
  }, [router, productId])

  const fetchOptions = async () => {
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

      const response = await fetch(`/api/admin/products/${productId}/options`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      })

      const data = await response.json()

      if (data.ok) {
        setProduct(data.data.product)
        setOptions(data.data.options)
      } else {
        setError(data.error || '옵션 목록을 불러오는데 실패했습니다.')
        showError('옵션 목록 로드 실패', data.error || '옵션 목록을 불러오는데 실패했습니다.')
      }
    } catch (error) {
      console.error('API 호출 에러:', error)
      setError('옵션 목록을 불러오는데 실패했습니다.')
      showError('옵션 목록 로드 실패', '옵션 목록을 불러오는데 실패했습니다.')
    }
  }

  const handleCreateOption = () => {
    setEditingOption(null)
    setOptionFormData({
      name: '',
      description: '',
      isRequired: false,
      sortOrder: options.length
    })
    setIsOptionModalOpen(true)
  }

  const handleEditOption = (option: ProductOption) => {
    setEditingOption(option)
    setOptionFormData({
      name: option.name,
      description: option.description || '',
      isRequired: option.isRequired,
      sortOrder: option.sortOrder
    })
    setIsOptionModalOpen(true)
  }

  const handleSubmitOption = async (e: React.FormEvent) => {
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

      const url = editingOption 
        ? `/api/admin/products/${productId}/options/${editingOption.id}`
        : `/api/admin/products/${productId}/options`
      
      const method = editingOption ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
        },
        body: JSON.stringify(optionFormData),
      })

      const data = await response.json()

      if (data.ok) {
        setIsOptionModalOpen(false)
        fetchOptions()
        if (editingOption) {
          showSuccess('옵션 수정 완료', '옵션이 성공적으로 수정되었습니다.')
        } else {
          showSuccess('옵션 생성 완료', '새 옵션이 성공적으로 생성되었습니다.')
        }
      } else {
        showError('옵션 저장 실패', data.error || '옵션 저장에 실패했습니다.')
      }
    } catch (error) {
      console.error('옵션 저장 에러:', error)
      showError('옵션 저장 실패', '옵션 저장 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteOption = async (option: ProductOption) => {
    if (!confirm(`"${option.name}" 옵션을 삭제하시겠습니까?`)) {
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

      const response = await fetch(`/api/admin/products/${productId}/options/${option.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      })

      const data = await response.json()

      if (data.ok) {
        fetchOptions()
        showSuccess('옵션 삭제 완료', '옵션이 성공적으로 삭제되었습니다.')
      } else {
        showError('옵션 삭제 실패', data.error || '옵션 삭제에 실패했습니다.')
      }
    } catch (error) {
      console.error('옵션 삭제 에러:', error)
      showError('옵션 삭제 실패', '옵션 삭제 중 오류가 발생했습니다.')
    }
  }

  const handleCreateValue = (option: ProductOption) => {
    setSelectedOption(option)
    setEditingValue(null)
    setValueFormData({
      value: '',
      price: 0,
      isActive: true,
      sortOrder: option.values.length
    })
    setIsValueModalOpen(true)
  }

  const handleEditValue = (value: ProductOptionValue, option: ProductOption) => {
    setSelectedOption(option)
    setEditingValue(value)
    setValueFormData({
      value: value.value,
      price: value.price,
      isActive: value.isActive,
      sortOrder: value.sortOrder
    })
    setIsValueModalOpen(true)
  }

  const handleSubmitValue = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedOption) return

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

      const url = editingValue 
        ? `/api/admin/products/${productId}/options/${selectedOption.id}/values/${editingValue.id}`
        : `/api/admin/products/${productId}/options/${selectedOption.id}/values`
      
      const method = editingValue ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
        },
        body: JSON.stringify(valueFormData),
      })

      const data = await response.json()

      if (data.ok) {
        setIsValueModalOpen(false)
        fetchOptions()
        if (editingValue) {
          showSuccess('옵션 값 수정 완료', '옵션 값이 성공적으로 수정되었습니다.')
        } else {
          showSuccess('옵션 값 생성 완료', '새 옵션 값이 성공적으로 생성되었습니다.')
        }
      } else {
        showError('옵션 값 저장 실패', data.error || '옵션 값 저장에 실패했습니다.')
      }
    } catch (error) {
      console.error('옵션 값 저장 에러:', error)
      showError('옵션 값 저장 실패', '옵션 값 저장 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteValue = async (value: ProductOptionValue, option: ProductOption) => {
    if (!confirm(`"${value.value}" 옵션 값을 삭제하시겠습니까?`)) {
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

      const response = await fetch(`/api/admin/products/${productId}/options/${option.id}/values/${value.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      })

      const data = await response.json()

      if (data.ok) {
        fetchOptions()
        showSuccess('옵션 값 삭제 완료', '옵션 값이 성공적으로 삭제되었습니다.')
      } else {
        showError('옵션 값 삭제 실패', data.error || '옵션 값 삭제에 실패했습니다.')
      }
    } catch (error) {
      console.error('옵션 값 삭제 에러:', error)
      showError('옵션 값 삭제 실패', '옵션 값 삭제 중 오류가 발생했습니다.')
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price)
  }

  if (isLoading) {
    return (
      <AdminLayout title="상품 옵션 관리" description="상품의 옵션을 관리할 수 있습니다">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">로딩 중...</div>
        </div>
      </AdminLayout>
    )
  }

  if (!product) {
    return (
      <AdminLayout title="상품 옵션 관리" description="상품의 옵션을 관리할 수 있습니다">
        <div className="text-center py-8">
          <div className="text-red-600">상품을 찾을 수 없습니다.</div>
        </div>
      </AdminLayout>
    )
  }

  if (!product.useOptions) {
    return (
      <AdminLayout title="상품 옵션 관리" description="상품의 옵션을 관리할 수 있습니다">
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

  return (
    <AdminLayout title="상품 옵션 관리" description={`${product.name}의 옵션을 관리할 수 있습니다`}>
      <div className="space-y-6">
        {/* 상품 정보 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">{product.name}</h2>
              <p className="text-gray-600">상품 옵션 관리</p>
            </div>
            <button
              onClick={() => router.push('/admin/products')}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
            >
              상품 목록으로
            </button>
          </div>
        </div>

        {/* 옵션 목록 */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-800">옵션 목록</h3>
              <button
                onClick={handleCreateOption}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                새 옵션 추가
              </button>
            </div>
          </div>

          <div className="p-6">
            {options.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                등록된 옵션이 없습니다.
              </div>
            ) : (
              <div className="space-y-6">
                {options.map((option) => (
                  <div key={option.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-lg font-medium text-gray-800">
                          {option.name}
                          {option.isRequired && (
                            <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                              필수
                            </span>
                          )}
                        </h4>
                        {option.description && (
                          <p className="text-gray-600 text-sm mt-1">{option.description}</p>
                        )}
                        <p className="text-gray-500 text-sm mt-1">
                          옵션 값 {option._count.values}개
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleCreateValue(option)}
                          className="text-blue-600 hover:text-blue-900 text-sm"
                        >
                          값 추가
                        </button>
                        <button
                          onClick={() => handleEditOption(option)}
                          className="text-indigo-600 hover:text-indigo-900 text-sm"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleDeleteOption(option)}
                          className="text-red-600 hover:text-red-900 text-sm"
                        >
                          삭제
                        </button>
                      </div>
                    </div>

                    {/* 옵션 값 목록 */}
                    {option.values.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h5 className="text-sm font-medium text-gray-700 mb-3">옵션 값</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {option.values.map((value) => (
                            <div key={value.id} className="bg-white border border-gray-200 rounded-lg p-3">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2">
                                    <span className="font-medium text-gray-800">{value.value}</span>
                                    {!value.isActive && (
                                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                        비활성
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-indigo-600 text-sm mt-1">
                                    +{formatPrice(value.price)}원
                                  </p>
                                </div>
                                <div className="flex space-x-1 ml-2">
                                  <button
                                    onClick={() => handleEditValue(value, option)}
                                    className="text-indigo-600 hover:text-indigo-900 text-xs"
                                  >
                                    수정
                                  </button>
                                  <button
                                    onClick={() => handleDeleteValue(value, option)}
                                    className="text-red-600 hover:text-red-900 text-xs"
                                  >
                                    삭제
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 옵션 생성/수정 모달 */}
        {isOptionModalOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-white rounded-lg shadow-lg">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingOption ? '옵션 수정' : '새 옵션 추가'}
                </h3>
                
                <form onSubmit={handleSubmitOption} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      옵션명 *
                    </label>
                    <input
                      type="text"
                      value={optionFormData.name}
                      onChange={(e) => setOptionFormData({ ...optionFormData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      설명
                    </label>
                    <textarea
                      value={optionFormData.description}
                      onChange={(e) => setOptionFormData({ ...optionFormData, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      정렬 순서
                    </label>
                    <input
                      type="number"
                      value={optionFormData.sortOrder}
                      onChange={(e) => setOptionFormData({ ...optionFormData, sortOrder: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      min="0"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={optionFormData.isRequired}
                      onChange={(e) => setOptionFormData({ ...optionFormData, isRequired: e.target.checked })}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label className="ml-2 text-sm text-gray-700">필수 옵션</label>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsOptionModalOpen(false)}
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

        {/* 옵션 값 생성/수정 모달 */}
        {isValueModalOpen && selectedOption && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-white rounded-lg shadow-lg">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingValue ? '옵션 값 수정' : '새 옵션 값 추가'}
                </h3>
                <p className="text-sm text-gray-600 mb-4">옵션: {selectedOption.name}</p>
                
                <form onSubmit={handleSubmitValue} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      옵션 값 *
                    </label>
                    <input
                      type="text"
                      value={valueFormData.value}
                      onChange={(e) => setValueFormData({ ...valueFormData, value: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      추가 가격 (원)
                    </label>
                    <input
                      type="number"
                      value={valueFormData.price}
                      onChange={(e) => setValueFormData({ ...valueFormData, price: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      정렬 순서
                    </label>
                    <input
                      type="number"
                      value={valueFormData.sortOrder}
                      onChange={(e) => setValueFormData({ ...valueFormData, sortOrder: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      min="0"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={valueFormData.isActive}
                      onChange={(e) => setValueFormData({ ...valueFormData, isActive: e.target.checked })}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label className="ml-2 text-sm text-gray-700">활성</label>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsValueModalOpen(false)}
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
