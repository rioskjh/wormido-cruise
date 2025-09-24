'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/AdminLayout'
import { useToast } from '@/contexts/ToastContext'
import ReactQuillEditor from '@/components/ReactQuillEditor'

export const dynamic = 'force-dynamic'

interface ProductCategory {
  id: number
  name: string
  description: string | null
}

interface Product {
  id: number
  name: string
  description: string | null
  detailHtml: string | null
  categoryId: number | null
  category: ProductCategory | null
  basePrice: number
  adultPrice: number
  childPrice: number
  infantPrice: number
  maxCapacity: number
  currentBookings: number
  isActive: boolean
  useOptions: boolean
  startDate: string | null
  endDate: string | null
  createdAt: string
  updatedAt: string
  images: {
    id: number
    fileName: string
    filePath: string
    sortOrder: number
  }[]
  _count: {
    reservations: number
    orders: number
  }
}

interface ProductFormData {
  name: string
  description: string
  detailHtml: string
  categoryId: number | null
  basePrice: number
  adultPrice: number
  childPrice: number
  infantPrice: number
  maxCapacity: number
  isActive: boolean
  useOptions: boolean
  startDate: string
  endDate: string
}

interface ProductImage {
  id: number
  productId: number
  fileName: string
  filePath: string
  fileSize: number
  sortOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    detailHtml: '',
    categoryId: null,
    basePrice: 0,
    adultPrice: 0,
    childPrice: 0,
    infantPrice: 0,
    maxCapacity: 50,
    isActive: true,
    useOptions: false,
    startDate: '',
    endDate: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [productImages, setProductImages] = useState<ProductImage[]>([])
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [isUploadingImages, setIsUploadingImages] = useState(false)
  const router = useRouter()
  const { showSuccess, showError } = useToast()

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

      await Promise.all([fetchProducts(), fetchCategories()])
      setIsLoading(false)
    }

    checkAuth()
  }, [router, searchTerm, selectedCategory])

  const fetchProducts = async () => {
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

      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (selectedCategory) params.append('categoryId', selectedCategory)

      const response = await fetch(`/api/admin/products?${params}`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      })

      const data = await response.json()

      if (data.ok) {
        setProducts(data.data.products)
      } else {
        setError(data.error || '상품 목록을 불러오는데 실패했습니다.')
        showError('상품 목록 로드 실패', data.error || '상품 목록을 불러오는데 실패했습니다.')
      }
    } catch (error) {
      console.error('API 호출 에러:', error)
      setError('상품 목록을 불러오는데 실패했습니다.')
      showError('상품 목록 로드 실패', '상품 목록을 불러오는데 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCategories = async () => {
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

      const response = await fetch('/api/admin/categories', {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      })

      const data = await response.json()

      if (data.ok) {
        setCategories(data.data)
      }
    } catch (error) {
      console.error('카테고리 목록 로드 에러:', error)
    }
  }

  const handleCreateProduct = () => {
    setEditingProduct(null)
    setFormData({
      name: '',
      description: '',
      detailHtml: '',
      categoryId: null,
      basePrice: 0,
      adultPrice: 0,
      childPrice: 0,
      infantPrice: 0,
      maxCapacity: 50,
      isActive: true,
      useOptions: false,
      startDate: '',
      endDate: '',
    })
    setProductImages([])
    setUploadedFiles([])
    setIsModalOpen(true)
  }

  const handleEditProduct = async (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description || '',
      detailHtml: product.detailHtml || '',
      categoryId: product.categoryId,
      basePrice: product.basePrice,
      adultPrice: product.adultPrice,
      childPrice: product.childPrice,
      infantPrice: product.infantPrice,
      maxCapacity: product.maxCapacity,
      isActive: product.isActive,
      useOptions: product.useOptions,
      startDate: product.startDate ? product.startDate.split('T')[0] : '',
      endDate: product.endDate ? product.endDate.split('T')[0] : '',
    })
    setUploadedFiles([])
    
    // 기존 이미지 로드
    await fetchProductImages(product.id)
    setIsModalOpen(true)
  }

  const handleManageOptions = (product: Product) => {
    router.push(`/admin/products/${product.id}/options`)
  }

  // 상품 이미지 목록 조회
  const fetchProductImages = async (productId: number) => {
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

      const response = await fetch(`/api/admin/products/${productId}/images`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      })

      const data = await response.json()

      if (data.ok) {
        setProductImages(data.data)
      }
    } catch (error) {
      console.error('이미지 목록 로드 에러:', error)
    }
  }

  // 파일 선택 핸들러
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const totalFiles = uploadedFiles.length + files.length
    
    if (totalFiles > 5) {
      showError('파일 업로드 제한', '최대 5개의 이미지만 업로드할 수 있습니다.')
      return
    }

    // 파일 타입 검증
    const invalidFiles = files.filter(file => !file.type.startsWith('image/'))
    if (invalidFiles.length > 0) {
      showError('파일 타입 오류', '이미지 파일만 업로드할 수 있습니다.')
      return
    }

    // 파일 크기 검증 (5MB 제한)
    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024)
    if (oversizedFiles.length > 0) {
      showError('파일 크기 오류', '파일 크기는 5MB를 초과할 수 없습니다.')
      return
    }

    setUploadedFiles(prev => [...prev, ...files])
  }

  // 파일 제거 핸들러
  const handleRemoveFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  // 이미지 삭제 핸들러
  const handleDeleteImage = async (imageId: number) => {
    if (!editingProduct) return

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

      const response = await fetch(`/api/admin/products/${editingProduct.id}/images/${imageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      })

      const data = await response.json()

      if (data.ok) {
        setProductImages(prev => prev.filter(img => img.id !== imageId))
        showSuccess('이미지 삭제 완료', '이미지가 성공적으로 삭제되었습니다.')
      } else {
        showError('이미지 삭제 실패', data.error || '이미지 삭제에 실패했습니다.')
      }
    } catch (error) {
      console.error('이미지 삭제 에러:', error)
      showError('이미지 삭제 실패', '이미지 삭제 중 오류가 발생했습니다.')
    }
  }

  // 이미지 업로드 핸들러
  const handleUploadImages = async (productId: number) => {
    if (uploadedFiles.length === 0) return

    setIsUploadingImages(true)

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

      const formData = new FormData()
      uploadedFiles.forEach(file => {
        formData.append('images', file)
      })

      const response = await fetch(`/api/admin/products/${productId}/images`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
        body: formData,
      })

      const data = await response.json()

      if (data.ok) {
        setProductImages(prev => [...prev, ...data.data])
        setUploadedFiles([])
        showSuccess('이미지 업로드 완료', data.message)
      } else {
        showError('이미지 업로드 실패', data.error || '이미지 업로드에 실패했습니다.')
      }
    } catch (error) {
      console.error('이미지 업로드 에러:', error)
      showError('이미지 업로드 실패', '이미지 업로드 중 오류가 발생했습니다.')
    } finally {
      setIsUploadingImages(false)
    }
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

      const url = editingProduct 
        ? `/api/admin/products/${editingProduct.id}`
        : '/api/admin/products'
      
      const method = editingProduct ? 'PUT' : 'POST'

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
        const productId = data.data.id || editingProduct?.id
        
        // 새 상품인 경우 이미지 업로드
        if (!editingProduct && uploadedFiles.length > 0 && productId) {
          await handleUploadImages(productId)
        }
        
        setIsModalOpen(false)
        fetchProducts()
        if (editingProduct) {
          showSuccess('상품 수정 완료', '상품이 성공적으로 수정되었습니다.')
        } else {
          showSuccess('상품 생성 완료', '새 상품이 성공적으로 생성되었습니다.')
        }
      } else {
        showError('상품 저장 실패', data.error || '상품 저장에 실패했습니다.')
      }
    } catch (error) {
      console.error('상품 저장 에러:', error)
      showError('상품 저장 실패', '상품 저장 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteProduct = async (product: Product) => {
    if (!confirm(`"${product.name}" 상품을 삭제하시겠습니까?`)) {
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

      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      })

      const data = await response.json()

      if (data.ok) {
        fetchProducts()
        showSuccess('상품 삭제 완료', '상품이 성공적으로 삭제되었습니다.')
      } else {
        showError('상품 삭제 실패', data.error || '상품 삭제에 실패했습니다.')
      }
    } catch (error) {
      console.error('상품 삭제 에러:', error)
      showError('상품 삭제 실패', '상품 삭제 중 오류가 발생했습니다.')
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('ko-KR')
  }

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
        활성
      </span>
    ) : (
      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
        비활성
      </span>
    )
  }

  if (isLoading) {
    return (
      <AdminLayout title="상품 관리" description="상품을 관리할 수 있습니다">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">로딩 중...</div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="상품 관리" description="상품을 관리할 수 있습니다">
      <div className="space-y-6">
        {/* 검색 및 필터 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="상품명 또는 설명으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="sm:w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">모든 카테고리</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleCreateProduct}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 whitespace-nowrap"
            >
              새 상품 추가
            </button>
          </div>
        </div>

        {/* 상품 목록 */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상품명
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    카테고리
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    가격
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
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        {/* 상품 썸네일 이미지 */}
                        <div className="flex-shrink-0">
                          {product.images && product.images.length > 0 ? (
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                              <img
                                src={product.images[0].filePath}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        
                        {/* 상품 정보 */}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                          {product.description && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {product.description}
                            </div>
                          )}
                          {product.useOptions && (
                            <div className="text-xs text-blue-600 mt-1">
                              옵션 사용
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.category?.name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="space-y-1">
                        <div>성인: {formatPrice(product.adultPrice)}원</div>
                        <div>아동: {formatPrice(product.childPrice)}원</div>
                        <div>유아: {formatPrice(product.infantPrice)}원</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.currentBookings}/{product.maxCapacity}명
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product._count.reservations}건
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(product.isActive)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(product.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product)}
                          className="text-red-600 hover:text-red-900"
                        >
                          삭제
                        </button>
                        {product.useOptions && (
                          <button
                            onClick={() => handleManageOptions(product)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            옵션 관리
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* 상품 생성/수정 모달 */}
      {isModalOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="relative w-full max-w-lg bg-white rounded-lg shadow-lg my-4">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingProduct ? '상품 수정' : '새 상품 추가'}
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      상품명 *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      설명
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      상세정보
                    </label>
                    <ReactQuillEditor
                      value={formData.detailHtml}
                      onChange={(content) => setFormData({ ...formData, detailHtml: content })}
                      height={300}
                      placeholder="상품 상세정보를 입력하세요 (이미지, 링크 등 포함 가능)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      카테고리
                    </label>
                    <select
                      value={formData.categoryId || ''}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value ? parseInt(e.target.value) : null })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">카테고리 선택</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        기본 가격 (원)
                      </label>
                      <input
                        type="number"
                        value={formData.basePrice}
                        onChange={(e) => setFormData({ ...formData, basePrice: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        최대 수용 인원
                      </label>
                      <input
                        type="number"
                        value={formData.maxCapacity}
                        onChange={(e) => setFormData({ ...formData, maxCapacity: parseInt(e.target.value) || 1 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        min="1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        성인 가격 (원)
                      </label>
                      <input
                        type="number"
                        value={formData.adultPrice}
                        onChange={(e) => setFormData({ ...formData, adultPrice: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        아동 가격 (원)
                      </label>
                      <input
                        type="number"
                        value={formData.childPrice}
                        onChange={(e) => setFormData({ ...formData, childPrice: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        유아 가격 (원)
                      </label>
                      <input
                        type="number"
                        value={formData.infantPrice}
                        onChange={(e) => setFormData({ ...formData, infantPrice: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        시작일
                      </label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        종료일
                      </label>
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">활성</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.useOptions}
                        onChange={(e) => setFormData({ ...formData, useOptions: e.target.checked })}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">옵션 사용</span>
                    </label>
                  </div>

                  {/* 이미지 업로드 섹션 */}
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">상품 이미지</h4>
                    
                    {/* 파일 선택 */}
                    <div className="mb-4">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        최대 5개, 각 파일 5MB 이하, JPG/PNG/GIF 형식
                      </p>
                    </div>

                    {/* 선택된 파일 목록 */}
                    {uploadedFiles.length > 0 && (
                      <div className="mb-4">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">업로드할 파일:</h5>
                        <div className="space-y-2">
                          {uploadedFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                              <span className="text-sm text-gray-700">{file.name}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveFile(index)}
                                className="text-red-600 hover:text-red-800 text-sm"
                              >
                                제거
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 기존 이미지 목록 (수정 모드) */}
                    {editingProduct && productImages.length > 0 && (
                      <div className="mb-4">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">기존 이미지:</h5>
                        <div className="grid grid-cols-2 gap-2">
                          {productImages.map((image) => (
                            <div key={image.id} className="relative bg-gray-50 p-2 rounded">
                              <div className="text-sm text-gray-700 truncate">{image.fileName}</div>
                              <button
                                type="button"
                                onClick={() => handleDeleteImage(image.id)}
                                className="absolute top-1 right-1 text-red-600 hover:text-red-800 text-xs"
                              >
                                삭제
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 수정 모드에서 새 이미지 업로드 버튼 */}
                    {editingProduct && uploadedFiles.length > 0 && (
                      <div className="mb-4">
                        <button
                          type="button"
                          onClick={() => editingProduct && handleUploadImages(editingProduct.id)}
                          disabled={isUploadingImages}
                          className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm"
                        >
                          {isUploadingImages ? '업로드 중...' : `${uploadedFiles.length}개 이미지 업로드`}
                        </button>
                      </div>
                    )}
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
    </AdminLayout>
  )
}