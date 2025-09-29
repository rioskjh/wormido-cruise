'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/AdminLayout'
import Link from 'next/link'

interface Navigation {
  id: number
  title: string
  url: string | null
  type: 'CUSTOM' | 'PRODUCTS' | 'BOARD' | 'CONTENT' | 'EXTERNAL'
  targetId: number | null
  parentId: number | null
  sortOrder: number
  isActive: boolean
  isNewWindow: boolean
  children: Navigation[]
  createdAt: string
  updatedAt: string
}

export default function AdminNavigationsPage() {
  const router = useRouter()
  const [navigations, setNavigations] = useState<Navigation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchNavigations()
  }, [])

  const fetchNavigations = async () => {
    try {
      setLoading(true)
      const adminToken = localStorage.getItem('adminToken')
      const response = await fetch('/api/admin/navigations', {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      })
      const data = await response.json()

      if (data.ok) {
        setNavigations(data.data)
      } else {
        setError(data.error)
      }
    } catch (error) {
      console.error('네비게이션 조회 오류:', error)
      setError('네비게이션 조회 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('정말로 이 네비게이션을 삭제하시겠습니까?')) {
      return
    }

    try {
      const adminToken = localStorage.getItem('adminToken')
      const response = await fetch(`/api/admin/navigations/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      })
      const data = await response.json()

      if (data.ok) {
        fetchNavigations()
      } else {
        alert(data.error)
      }
    } catch (error) {
      console.error('네비게이션 삭제 오류:', error)
      alert('네비게이션 삭제 중 오류가 발생했습니다.')
    }
  }

  const handleToggleActive = async (id: number, isActive: boolean) => {
    try {
      const adminToken = localStorage.getItem('adminToken')
      const response = await fetch(`/api/admin/navigations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ isActive: !isActive })
      })
      const data = await response.json()

      if (data.ok) {
        fetchNavigations()
      } else {
        alert(data.error)
      }
    } catch (error) {
      console.error('네비게이션 상태 변경 오류:', error)
      alert('네비게이션 상태 변경 중 오류가 발생했습니다.')
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'CUSTOM': return '사용자 정의'
      case 'PRODUCTS': return '상품 목록'
      case 'BOARD': return '게시판'
      case 'CONTENT': return '컨텐츠'
      case 'EXTERNAL': return '외부 링크'
      default: return type
    }
  }

  const renderNavigationItem = (nav: Navigation, level: number = 0) => {
    return (
      <div key={nav.id} className={`${level > 0 ? 'ml-6 border-l-2 border-gray-200 pl-4' : ''}`}>
        <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg mb-2">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">#{nav.sortOrder}</span>
              <span className={`px-2 py-1 text-xs rounded ${nav.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {nav.isActive ? '활성' : '비활성'}
              </span>
              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                {getTypeLabel(nav.type)}
              </span>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{nav.title}</h3>
              {nav.url && (
                <p className="text-sm text-gray-500">{nav.url}</p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleToggleActive(nav.id, nav.isActive)}
              className={`px-3 py-1 text-sm rounded ${
                nav.isActive 
                  ? 'bg-red-100 text-red-800 hover:bg-red-200' 
                  : 'bg-green-100 text-green-800 hover:bg-green-200'
              }`}
            >
              {nav.isActive ? '비활성화' : '활성화'}
            </button>
            <Link
              href={`/admin/navigations/${nav.id}/edit`}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
            >
              수정
            </Link>
            <button
              onClick={() => handleDelete(nav.id)}
              className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded hover:bg-red-200"
            >
              삭제
            </button>
          </div>
        </div>
        {nav.children.map(child => renderNavigationItem(child, level + 1))}
      </div>
    )
  }

  if (loading) {
    return (
      <AdminLayout title="네비게이션 관리">
        <div className="p-6">
          <div className="text-center">로딩 중...</div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="네비게이션 관리">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">네비게이션 관리</h1>
          <div className="flex gap-3">
            <button
              onClick={() => {
                fetchNavigations()
                // 사용자 페이지 네비게이션도 강제 새로고침
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new Event('navigation-refresh'))
                }
              }}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              새로고침
            </button>
            <Link
              href="/admin/navigations/create"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              새 메뉴 추가
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">메뉴 목록</h2>
            <p className="text-sm text-gray-600 mt-1">
              최상위 메뉴는 최대 6개까지 등록 가능합니다.
            </p>
          </div>
          
          <div className="p-4">
            {navigations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                등록된 메뉴가 없습니다.
              </div>
            ) : (
              <div className="space-y-2">
                {navigations.map(nav => renderNavigationItem(nav))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
