'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/AdminLayout'

interface Content {
  id: number
  title: string
  slug: string
}

interface Category {
  id: number
  name: string
  sortOrder: number
}

interface Board {
  id: number
  title: string
  boardId: string
}

interface Navigation {
  id: number
  title: string
  url: string | null
  type: 'CUSTOM' | 'PRODUCTS' | 'BOARD' | 'CONTENT' | 'EXTERNAL' | 'SCHEDULE'
  targetId: number | null
  parentId: number | null
  sortOrder: number
  isActive: boolean
  isNewWindow: boolean
  children: Navigation[]
  createdAt: string
  updatedAt: string
}

export default function AdminNavigationCreatePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [contents, setContents] = useState<Content[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [boards, setBoards] = useState<Board[]>([])
  const [navigations, setNavigations] = useState<Navigation[]>([])
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    type: 'CUSTOM' as 'CUSTOM' | 'PRODUCTS' | 'BOARD' | 'CONTENT' | 'EXTERNAL' | 'SCHEDULE',
    targetId: '',
    parentId: '',
    sortOrder: 0,
    isActive: true,
    isNewWindow: false
  })

  useEffect(() => {
    fetchContents()
    fetchCategories()
    fetchBoards()
    fetchNavigations()
  }, [])

  const fetchContents = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken')
      const response = await fetch('/api/admin/contents', {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      })
      const data = await response.json()

      if (data.ok) {
        setContents(data.data.contents || [])
      }
    } catch (error) {
      console.error('컨텐츠 조회 오류:', error)
    }
  }

  const fetchCategories = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken')
      const response = await fetch('/api/admin/categories/list', {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      })
      const data = await response.json()

      if (data.ok) {
        setCategories(data.data || [])
      }
    } catch (error) {
      console.error('카테고리 조회 오류:', error)
    }
  }

  const fetchBoards = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken')
      const response = await fetch('/api/admin/boards/list', {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      })
      const data = await response.json()

      if (data.ok) {
        setBoards(data.data || [])
      }
    } catch (error) {
      console.error('게시판 조회 오류:', error)
    }
  }

  const fetchNavigations = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken')
      const response = await fetch('/api/admin/navigations', {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      })
      const data = await response.json()

      if (data.ok) {
        setNavigations(data.data || [])
      }
    } catch (error) {
      console.error('네비게이션 조회 오류:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      setError('')

      // 상품 목록 타입인 경우 카테고리 검증
      if (formData.type === 'PRODUCTS' && categories.length === 0) {
        setError('등록된 카테고리가 없어서 상품 목록 메뉴를 생성할 수 없습니다.')
        setLoading(false)
        return
      }

      // 게시판 타입인 경우 게시판 검증
      if (formData.type === 'BOARD' && boards.length === 0) {
        setError('등록된 게시판이 없어서 게시판 메뉴를 생성할 수 없습니다.')
        setLoading(false)
        return
      }

      const submitData = {
        ...formData,
        targetId: formData.targetId ? parseInt(formData.targetId) : undefined,
        parentId: formData.parentId ? parseInt(formData.parentId) : undefined,
        sortOrder: parseInt(formData.sortOrder.toString())
      }

      const adminToken = localStorage.getItem('adminToken')
      const response = await fetch('/api/admin/navigations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(submitData),
      })

      const data = await response.json()

      if (data.ok) {
        // 사용자 페이지 네비게이션도 강제 새로고침
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('navigation-refresh'))
        }
        router.push('/admin/navigations')
      } else {
        setError(data.error)
      }
    } catch (error) {
      console.error('네비게이션 생성 오류:', error)
      setError('네비게이션 생성 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  return (
    <AdminLayout title="새 메뉴 추가">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">새 메뉴 추가</h1>
          <button
            onClick={() => router.back()}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            목록으로
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">기본 정보</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  메뉴 제목 *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  메뉴 타입 *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="CUSTOM">사용자 정의 링크</option>
                  <option value="PRODUCTS">상품 목록</option>
                  <option value="BOARD">게시판</option>
                  <option value="CONTENT">컨텐츠 페이지</option>
                  <option value="EXTERNAL">외부 링크</option>
                  <option value="SCHEDULE">일정관리</option>
                </select>
              </div>

              {(formData.type === 'CUSTOM' || formData.type === 'EXTERNAL') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL
                  </label>
                  <input
                    type="text"
                    name="url"
                    value={formData.url}
                    onChange={handleInputChange}
                    placeholder={formData.type === 'EXTERNAL' ? 'https://example.com' : '/about'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {formData.type === 'EXTERNAL' ? '외부 링크 URL을 입력하세요.' : '내부 페이지 경로를 입력하세요.'}
                  </p>
                </div>
              )}

              {formData.type === 'PRODUCTS' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    상품 목록 설정
                  </label>
                  {categories.length === 0 ? (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-600">
                        등록된 카테고리가 없습니다. 먼저 카테고리를 등록해주세요.
                      </p>
                    </div>
                  ) : (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                      <p className="text-sm text-green-600 mb-2">
                        등록된 카테고리: {categories.length}개
                      </p>
                      <ul className="text-sm text-gray-600">
                        {Array.isArray(categories) && categories.map(category => (
                          <li key={category.id}>• {category.name}</li>
                        ))}
                      </ul>
                      <p className="text-xs text-gray-500 mt-2">
                        카테고리가 2개 이상인 경우 2뎁스 메뉴로 표시됩니다.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {formData.type === 'BOARD' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    연결할 게시판
                  </label>
                  {boards.length === 0 ? (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-600">
                        등록된 게시판이 없습니다. 먼저 게시판을 등록해주세요.
                      </p>
                    </div>
                  ) : (
                    <select
                      name="targetId"
                      value={formData.targetId}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">게시판을 선택하세요</option>
                      {Array.isArray(boards) && boards.map(board => (
                        <option key={board.id} value={board.id}>
                          {board.title}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {formData.type === 'CONTENT' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    연결할 컨텐츠
                  </label>
                  <select
                    name="targetId"
                    value={formData.targetId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">컨텐츠를 선택하세요</option>
                    {Array.isArray(contents) && contents.map(content => (
                      <option key={content.id} value={content.id}>
                        {content.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  정렬 순서
                </label>
                <input
                  type="number"
                  name="sortOrder"
                  value={formData.sortOrder}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  부모 메뉴
                </label>
                <select
                  name="parentId"
                  value={formData.parentId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">최상위 메뉴 (하위 메뉴가 아님)</option>
                  {Array.isArray(navigations) && navigations
                    .filter(nav => !nav.parentId) // 최상위 메뉴만 표시
                    .map(nav => (
                      <option key={nav.id} value={nav.id}>
                        {nav.title} ({nav.type})
                      </option>
                    ))}
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  부모 메뉴를 선택하면 하위 메뉴가 됩니다. 비워두면 최상위 메뉴가 됩니다.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  활성화
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isNewWindow"
                  checked={formData.isNewWindow}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  새 창에서 열기
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? '생성 중...' : '생성'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}
