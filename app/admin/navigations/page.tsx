'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/AdminLayout'
import Link from 'next/link'
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

// 드래그 가능한 네비게이션 아이템 컴포넌트
function SortableNavigationItem({ 
  nav, 
  level, 
  onDelete, 
  onToggleActive, 
  getTypeLabel,
  isUpdatingOrder = false
}: {
  nav: Navigation
  level: number
  onDelete: (id: number) => void
  onToggleActive: (id: number, isActive: boolean) => void
  getTypeLabel: (type: string) => string
  isUpdatingOrder?: boolean
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: nav.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border border-gray-200 rounded-lg p-4 mb-2 ${
        isDragging ? 'shadow-lg' : 'shadow-sm'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* 드래그 핸들 */}
          <div
            {...(isUpdatingOrder ? {} : attributes)}
            {...(isUpdatingOrder ? {} : listeners)}
            className={`p-1 rounded ${
              isUpdatingOrder 
                ? 'cursor-not-allowed opacity-50' 
                : 'cursor-grab active:cursor-grabbing hover:bg-gray-100'
            }`}
            title={isUpdatingOrder ? "순서 업데이트 중입니다" : "드래그하여 순서 변경"}
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16" />
            </svg>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">#{nav.sortOrder}</span>
              <h3 className="font-medium text-gray-900">{nav.title}</h3>
              <span className={`px-2 py-1 text-xs rounded-full ${
                nav.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {nav.isActive ? '활성' : '비활성'}
              </span>
              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                {getTypeLabel(nav.type)}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {nav.url || '하위 메뉴 있음'} {nav.isNewWindow && '(새 창)'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleActive(nav.id, nav.isActive)}
            disabled={isUpdatingOrder}
            className={`px-3 py-1 text-sm rounded ${
              isUpdatingOrder
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : nav.isActive 
                  ? 'bg-red-100 text-red-800 hover:bg-red-200' 
                  : 'bg-green-100 text-green-800 hover:bg-green-200'
            }`}
          >
            {nav.isActive ? '비활성화' : '활성화'}
          </button>
          <Link
            href={`/admin/navigations/${nav.id}/edit`}
            className={`px-3 py-1 text-sm rounded ${
              isUpdatingOrder
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none'
                : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
            }`}
          >
            수정
          </Link>
          <button
            onClick={() => onDelete(nav.id)}
            disabled={isUpdatingOrder}
            className={`px-3 py-1 text-sm rounded ${
              isUpdatingOrder
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-red-100 text-red-800 hover:bg-red-200'
            }`}
          >
            삭제
          </button>
        </div>
      </div>
      
      {/* 하위 메뉴 */}
      {Array.isArray(nav.children) && nav.children.length > 0 && (
        <div className="mt-3 ml-6 border-l-2 border-gray-200 pl-4">
          {nav.children.map((child) => (
            <div key={child.id} className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">#{child.sortOrder}</span>
                  <h4 className="font-medium text-gray-900">{child.title}</h4>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    child.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {child.isActive ? '활성' : '비활성'}
                  </span>
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                    {getTypeLabel(child.type)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onToggleActive(child.id, child.isActive)}
                    disabled={isUpdatingOrder}
                    className={`px-2 py-1 text-xs rounded ${
                      isUpdatingOrder
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : child.isActive 
                          ? 'bg-red-100 text-red-800 hover:bg-red-200' 
                          : 'bg-green-100 text-green-800 hover:bg-green-200'
                    }`}
                  >
                    {child.isActive ? '비활성화' : '활성화'}
                  </button>
                  <Link
                    href={`/admin/navigations/${child.id}/edit`}
                    className={`px-2 py-1 text-xs rounded ${
                      isUpdatingOrder
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none'
                        : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                    }`}
                  >
                    수정
                  </Link>
                  <button
                    onClick={() => onDelete(child.id)}
                    disabled={isUpdatingOrder}
                    className={`px-2 py-1 text-xs rounded ${
                      isUpdatingOrder
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                    }`}
                  >
                    삭제
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {child.url || '하위 메뉴 있음'} {child.isNewWindow && '(새 창)'}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function AdminNavigationsPage() {
  const router = useRouter()
  const [navigations, setNavigations] = useState<Navigation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isUpdatingOrder, setIsUpdatingOrder] = useState(false)
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px 이상 드래그해야 활성화
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

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
        // 사용자 페이지 네비게이션도 강제 새로고침
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('navigation-refresh'))
        }
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
        // 사용자 페이지 네비게이션도 강제 새로고침
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('navigation-refresh'))
        }
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

  // 드래그 앤 드롭 이벤트 핸들러
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = navigations.findIndex((nav) => nav.id === active.id)
      const newIndex = navigations.findIndex((nav) => nav.id === over.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        // 로딩 상태 시작
        setIsUpdatingOrder(true)
        
        // 로컬 상태 업데이트
        const newNavigations = arrayMove(navigations, oldIndex, newIndex)
        setNavigations(newNavigations)

        // 서버에 순서 업데이트 요청
        try {
          const adminToken = localStorage.getItem('adminToken')
          
          // 모든 네비게이션의 순서를 업데이트
          const updatePromises = newNavigations.map((nav, index) => {
            return fetch(`/api/admin/navigations/${nav.id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`
              },
              body: JSON.stringify({ sortOrder: index + 1 })
            })
          })

          await Promise.all(updatePromises)
          
          // 사용자 페이지 네비게이션 강제 새로고침 (다중 방법)
          if (typeof window !== 'undefined') {
            // 1. 커스텀 이벤트 발생
            window.dispatchEvent(new Event('navigation-refresh'))
            
            // 2. 전역 이벤트 발생 (다른 탭에서도 동기화)
            window.dispatchEvent(new CustomEvent('navigation-order-updated', {
              detail: { 
                timestamp: new Date().toISOString(),
                updatedCount: newNavigations.length 
              }
            }))
            
            // 3. 약간의 지연 후 추가 새로고침 (서버 반영 시간 고려)
            setTimeout(() => {
              window.dispatchEvent(new Event('navigation-refresh'))
              console.log('지연된 네비게이션 새로고침 실행')
            }, 500)
            
            // 4. localStorage에 타임스탬프 저장 (다른 컴포넌트에서 확인 가능)
            localStorage.setItem('navigation-last-updated', new Date().toISOString())
          }
          
          console.log('네비게이션 순서가 업데이트되었습니다. 사용자 페이지 동기화 완료.')
        } catch (error) {
          console.error('네비게이션 순서 업데이트 오류:', error)
          // 실패 시 원래 상태로 복원
          fetchNavigations()
          alert('네비게이션 순서 업데이트 중 오류가 발생했습니다.')
        } finally {
          // 로딩 상태 종료
          setIsUpdatingOrder(false)
        }
      }
    }
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
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">네비게이션 관리</h1>
            {isUpdatingOrder && (
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                순서 업데이트 중...
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                fetchNavigations()
                // 사용자 페이지 네비게이션도 강제 새로고침
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new Event('navigation-refresh'))
                }
              }}
              disabled={isUpdatingOrder}
              className={`px-4 py-2 rounded-lg transition-colors ${
                isUpdatingOrder 
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              새로고침
            </button>
            <Link
              href="/admin/navigations/create"
              className={`px-4 py-2 rounded-lg transition-colors ${
                isUpdatingOrder 
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed pointer-events-none' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
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
            {!Array.isArray(navigations) || navigations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                등록된 메뉴가 없습니다.
              </div>
            ) : (
              <div className={`relative ${isUpdatingOrder ? 'pointer-events-none opacity-50' : ''}`}>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={navigations.map(nav => nav.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2">
                      {navigations.map((nav) => (
                        <SortableNavigationItem
                          key={nav.id}
                          nav={nav}
                          level={0}
                          onDelete={handleDelete}
                          onToggleActive={handleToggleActive}
                          getTypeLabel={getTypeLabel}
                          isUpdatingOrder={isUpdatingOrder}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
                
                {/* 로딩 오버레이 */}
                {isUpdatingOrder && (
                  <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
                    <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-lg shadow-lg border">
                      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-gray-700 font-medium">순서를 업데이트하고 있습니다...</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
