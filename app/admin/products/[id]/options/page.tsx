'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import AdminLayout from '@/components/AdminLayout'
import { useToast } from '@/contexts/ToastContext'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export const dynamic = 'force-dynamic'

// SortableItem 컴포넌트
function SortableItem({ value, option, onEdit, onDelete }: {
  value: ProductOptionValue
  option: ProductOption
  onEdit: (value: ProductOptionValue, option: ProductOption) => void
  onDelete: (value: ProductOptionValue, option: ProductOption) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `${option.id}-${value.id}` })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
            </svg>
          </div>
          <div>
            <div className="font-medium text-gray-900">{value.value}</div>
            <div className="text-sm text-gray-500">+{value.price.toLocaleString()}원</div>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(value, option)}
            className="text-indigo-600 hover:text-indigo-900 text-sm"
          >
            수정
          </button>
          <button
            onClick={() => onDelete(value, option)}
            className="text-red-600 hover:text-red-900 text-sm"
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  )
}

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
  sortOrder: number
  isActive: boolean
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
    sortOrder: 0,
    isActive: true
  })
  const [valueFormData, setValueFormData] = useState<OptionValueFormData>({
    value: '',
    price: 0,
    isActive: true,
    sortOrder: 0
  })
  const [bulkValues, setBulkValues] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const params = useParams()
  const { showSuccess, showError } = useToast()

  const productId = params.id as string

  // 드래그 앤 드롭 센서 설정
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // 옵션 값 유효성 검사 함수
  const validateOptionValue = (value: string, optionId?: number, excludeValueId?: number): { isValid: boolean; error?: string } => {
    if (!value || value.trim().length === 0) {
      return { isValid: false, error: '옵션 값은 비어있을 수 없습니다.' }
    }

    // 허용된 문자: 한글, 영문, 숫자, 하이픈(-), 언더스코어(_), 공백
    const allowedPattern = /^[가-힣a-zA-Z0-9\s\-_]+$/
    
    if (!allowedPattern.test(value)) {
      return { 
        isValid: false, 
        error: '옵션 값에는 한글, 영문, 숫자, 하이픈(-), 언더스코어(_)만 사용할 수 있습니다.' 
      }
    }

    // 길이 제한 (최대 50자)
    if (value.length > 50) {
      return { isValid: false, error: '옵션 값은 50자를 초과할 수 없습니다.' }
    }

    // 중복 검증 (같은 옵션 내에서)
    if (optionId) {
      const option = options.find(opt => opt.id === optionId)
      if (option) {
        const existingValue = option.values.find(val => 
          val.value.toLowerCase() === value.toLowerCase() && 
          val.id !== excludeValueId
        )
        if (existingValue) {
          return { 
            isValid: false, 
            error: `"${value}"는 이미 등록된 옵션 값입니다.` 
          }
        }
      }
    }

    return { isValid: true }
  }

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
    // 옵션 최대 3개 제한
    if (options.length >= 3) {
      showError('옵션 제한', '상품당 최대 3개의 옵션만 등록할 수 있습니다.')
      return
    }

    setEditingOption(null)
    setOptionFormData({
      name: '',
      sortOrder: options.length,
      isActive: true
    })
    setIsOptionModalOpen(true)
  }

  const handleEditOption = (option: ProductOption) => {
    setEditingOption(option)
    setOptionFormData({
      name: option.name,
      sortOrder: option.sortOrder,
      isActive: option.isActive
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
    setBulkValues('')
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

      // 일괄 등록인 경우
      if (bulkValues.trim() && !editingValue) {
        const values = bulkValues
          .split('\n')
          .map(v => v.trim())
          .filter(v => v.length > 0)
        
        if (values.length === 0) {
          showError('입력 오류', '유효한 옵션 값을 입력해주세요.')
          return
        }

        // 각 값에 대한 유효성 검사
        const invalidValues: string[] = []
        for (const value of values) {
          const validation = validateOptionValue(value, selectedOption.id)
          if (!validation.isValid) {
            invalidValues.push(`${value}: ${validation.error}`)
          }
        }

        if (invalidValues.length > 0) {
          showError('유효성 검사 실패', `다음 옵션 값들이 유효하지 않습니다:\n${invalidValues.join('\n')}`)
          return
        }

        // 각 값에 대해 API 호출
        const promises = values.map((value, index) => {
          const valueData = {
            value,
            price: valueFormData.price,
            isActive: valueFormData.isActive,
            sortOrder: selectedOption.values.length + index
          }
          
          return fetch(`/api/admin/products/${productId}/options/${selectedOption.id}/values`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${adminToken}`,
            },
            body: JSON.stringify(valueData),
          })
        })

        const responses = await Promise.all(promises)
        const results = await Promise.all(responses.map(r => r.json()))
        
        const successCount = results.filter(r => r.ok).length
        const failCount = results.length - successCount

        if (successCount > 0) {
          setIsValueModalOpen(false)
          fetchOptions()
          if (failCount > 0) {
            showSuccess('옵션 값 일괄 등록 완료', `${successCount}개 성공, ${failCount}개 실패`)
          } else {
            showSuccess('옵션 값 일괄 등록 완료', `${successCount}개의 옵션 값이 성공적으로 등록되었습니다.`)
          }
        } else {
          showError('옵션 값 등록 실패', '모든 옵션 값 등록에 실패했습니다.')
        }
      } else {
        // 단일 등록/수정인 경우
        // 단일 값에 대한 유효성 검사
        const validation = validateOptionValue(
          valueFormData.value, 
          selectedOption.id, 
          editingValue?.id
        )
        if (!validation.isValid) {
          showError('유효성 검사 실패', validation.error || '옵션 값이 유효하지 않습니다.')
          return
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

  // 드래그 앤 드롭 핸들러
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    // 옵션 값의 순서를 찾기 위해 active.id와 over.id를 파싱
    const activeId = active.id as string
    const overId = over.id as string

    // activeId와 overId에서 옵션 ID와 값 ID를 추출
    const [activeOptionId, activeValueId] = activeId.split('-')
    const [overOptionId, overValueId] = overId.split('-')

    if (activeOptionId !== overOptionId) {
      return // 같은 옵션 내에서만 순서 변경 가능
    }

    const optionId = parseInt(activeOptionId)
    const option = options.find(opt => opt.id === optionId)
    
    if (!option) return

    const oldIndex = option.values.findIndex(v => v.id === parseInt(activeValueId))
    const newIndex = option.values.findIndex(v => v.id === parseInt(overValueId))

    if (oldIndex === -1 || newIndex === -1) return

    // 로컬 상태 업데이트
    const newValues = arrayMove(option.values, oldIndex, newIndex)
    
    // sortOrder 업데이트
    const updatedValues = newValues.map((value, index) => ({
      ...value,
      sortOrder: index
    }))

    // 옵션 상태 업데이트
    setOptions(prevOptions => 
      prevOptions.map(opt => 
        opt.id === optionId 
          ? { ...opt, values: updatedValues }
          : opt
      )
    )

    // 서버에 순서 변경 요청
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

      // 각 값의 sortOrder를 업데이트
      const updatePromises = updatedValues.map((value, index) => 
        fetch(`/api/admin/products/${productId}/options/${optionId}/values/${value.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`,
          },
          body: JSON.stringify({
            sortOrder: index
          }),
        })
      )

      await Promise.all(updatePromises)
      showSuccess('순서 변경 완료', '옵션 값의 순서가 성공적으로 변경되었습니다.')
    } catch (error) {
      console.error('순서 변경 에러:', error)
      showError('순서 변경 실패', '옵션 값 순서 변경 중 오류가 발생했습니다.')
      // 실패 시 원래 상태로 복원
      fetchOptions()
    }
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
              <div>
                <h3 className="text-lg font-medium text-gray-800">옵션 목록</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {options.length}/3개 등록됨 (최대 3개까지 등록 가능)
                </p>
              </div>
              <button
                onClick={handleCreateOption}
                disabled={options.length >= 3}
                className={`px-4 py-2 rounded-md font-medium ${
                  options.length >= 3
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {options.length >= 3 ? '옵션 제한' : '새 옵션 추가'}
              </button>
            </div>
          </div>

          <div className="p-6">
            {options.length === 0 ? (
              <div className="text-center py-12">
                <div className="mb-6">
                  <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">옵션이 없습니다</h3>
                  <p className="text-gray-500 mb-6">
                    이 상품에 대한 옵션을 설정해보세요.<br />
                    고객들이 예약할 때 선택할 수 있는 옵션을 추가할 수 있습니다.
                  </p>
                  <button
                    onClick={handleCreateOption}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 font-medium"
                  >
                    첫 번째 옵션 추가하기
                  </button>
                </div>
                
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">옵션 예시</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="font-medium text-gray-800 mb-2">룸 타입</div>
                      <ul className="space-y-1">
                        <li>• 일반실 (+0원)</li>
                        <li>• 바다전망실 (+10,000원)</li>
                        <li>• VIP룸 (+20,000원)</li>
                      </ul>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="font-medium text-gray-800 mb-2">식사 옵션</div>
                      <ul className="space-y-1">
                        <li>• 식사 없음 (+0원)</li>
                        <li>• 기본 식사 (+15,000원)</li>
                        <li>• 프리미엄 식사 (+25,000원)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {options.map((option) => (
                  <div key={option.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-lg font-medium text-gray-800">
                          {option.name}
                          {!option.isActive && (
                            <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                              비활성
                            </span>
                          )}
                        </h4>
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
                        <h5 className="text-sm font-medium text-gray-700 mb-3">옵션 값 (드래그로 순서 변경 가능)</h5>
                        <DndContext
                          sensors={sensors}
                          collisionDetection={closestCenter}
                          onDragEnd={handleDragEnd}
                        >
                          <SortableContext
                            items={option.values.map(v => `${option.id}-${v.id}`)}
                            strategy={verticalListSortingStrategy}
                          >
                            <div className="space-y-3">
                              {option.values
                                .sort((a, b) => a.sortOrder - b.sortOrder)
                                .map((value) => (
                                <SortableItem
                                  key={value.id}
                                  value={value}
                                  option={option}
                                  onEdit={handleEditValue}
                                  onDelete={handleDeleteValue}
                                />
                              ))}
                            </div>
                          </SortableContext>
                        </DndContext>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>


      {/* 옵션 생성/수정 모달 */}
      {isOptionModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-lg shadow-lg my-4">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingOption ? '옵션 수정' : '새 옵션 추가'}
              </h3>
              
              <form onSubmit={handleSubmitOption} className="space-y-3">
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
                    checked={optionFormData.isActive}
                    onChange={(e) => setOptionFormData({ ...optionFormData, isActive: e.target.checked })}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label className="ml-2 text-sm text-gray-700">활성</label>
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
          <div className="relative w-full max-w-md bg-white rounded-lg shadow-lg my-4">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingValue ? '옵션 값 수정' : '새 옵션 값 추가'}
              </h3>
              <p className="text-sm text-gray-600 mb-4">옵션: {selectedOption.name}</p>
              
              <form onSubmit={handleSubmitValue} className="space-y-3">
                {!editingValue && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      옵션 값 일괄 등록 (줄바꿈으로 구분)
                    </label>
                    <textarea
                      value={bulkValues}
                      onChange={(e) => setBulkValues(e.target.value)}
                      placeholder="예시:&#10;9월 1일&#10;9월 2일&#10;9월 3일&#10;..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 h-32 resize-none"
                      rows={6}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      한글, 영문, 숫자, 하이픈(-), 언더스코어(_)만 사용 가능 (최대 50자)
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {editingValue ? '옵션 값' : '단일 옵션 값 (일괄 등록과 함께 사용 가능)'} *
                  </label>
                  <input
                    type="text"
                    value={valueFormData.value}
                    onChange={(e) => setValueFormData({ ...valueFormData, value: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required={editingValue ? true : bulkValues.trim() === ''}
                    placeholder="예: 9월 1일"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    한글, 영문, 숫자, 하이픈(-), 언더스코어(_)만 사용 가능 (최대 50자)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    추가 가격
                  </label>
                  <input
                    type="number"
                    value={valueFormData.price}
                    onChange={(e) => setValueFormData({ ...valueFormData, price: parseInt(e.target.value) || 0 })}
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
                    {isSubmitting ? '저장 중...' : 
                     editingValue ? '수정' : 
                     bulkValues.trim() ? '일괄 등록' : '저장'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
