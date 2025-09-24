'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { useToast } from '@/contexts/ToastContext'
import ReactQuillEditor from '@/components/ReactQuillEditor'

interface Popup {
  id: number
  title: string
  content: string
  type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR' | 'PROMOTION' | 'NOTICE'
  position: 'CENTER' | 'TOP' | 'BOTTOM' | 'LEFT' | 'RIGHT' | 'TOP_LEFT' | 'TOP_RIGHT' | 'BOTTOM_LEFT' | 'BOTTOM_RIGHT'
  size: 'SMALL' | 'MEDIUM' | 'LARGE' | 'FULLSCREEN'
  isActive: boolean
  startDate?: string
  endDate?: string
  showCount: number
  maxShow?: number
  targetPages?: string
  excludePages?: string
  width?: number
  height?: number
  backgroundColor?: string
  textColor?: string
  borderColor?: string
  borderRadius?: number
  zIndex: number
  // 에디터 및 이미지 관련 필드
  contentHtml?: string
  images?: string
  // 쿠키 관련 필드
  showDontShowToday: boolean
  cookieExpireHours: number
  createdAt: string
  updatedAt: string
}

export default function PopupsPage() {
  const [popups, setPopups] = useState<Popup[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingPopup, setEditingPopup] = useState<Popup | null>(null)
  const [saving, setSaving] = useState(false)
  const { showError, showSuccess } = useToast()

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'INFO' as Popup['type'],
    position: 'CENTER' as Popup['position'],
    size: 'MEDIUM' as Popup['size'],
    isActive: true,
    startDate: '',
    endDate: '',
    maxShow: undefined as number | undefined,
    targetPages: '',
    excludePages: '',
    width: '',
    height: '',
    backgroundColor: '#ffffff',
    textColor: '#000000',
    borderColor: '#e5e7eb',
    borderRadius: '8',
    zIndex: '1000',
    // 에디터 및 이미지 관련 필드
    contentHtml: '',
    images: '',
    // 쿠키 관련 필드
    showDontShowToday: false,
    cookieExpireHours: 24
  })

  useEffect(() => {
    loadPopups()
  }, [])

  const loadPopups = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch('/api/admin/popups', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      
      if (data.ok) {
        setPopups(data.data)
      } else {
        showError('팝업 로드 실패', data.error || '팝업을 불러올 수 없습니다.')
      }
    } catch (error) {
      showError('서버 오류', '서버 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const token = localStorage.getItem('adminToken')
      const url = editingPopup ? `/api/admin/popups/${editingPopup.id}` : '/api/admin/popups'
      const method = editingPopup ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          maxShow: formData.maxShow || null,
          width: formData.width ? parseInt(formData.width) : null,
          height: formData.height ? parseInt(formData.height) : null,
          borderRadius: parseInt(formData.borderRadius),
          zIndex: parseInt(formData.zIndex)
        })
      })

      const data = await response.json()
      
      if (data.ok) {
        showSuccess('팝업 저장 완료', editingPopup ? '팝업이 수정되었습니다.' : '팝업이 생성되었습니다.')
        setShowModal(false)
        setEditingPopup(null)
        resetForm()
        loadPopups()
      } else {
        showError('저장 실패', data.error || '팝업 저장에 실패했습니다.')
      }
    } catch (error) {
      showError('서버 오류', '서버 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (popup: Popup) => {
    setEditingPopup(popup)
    setFormData({
      title: popup.title,
      content: popup.content,
      type: popup.type,
      position: popup.position,
      size: popup.size,
      isActive: popup.isActive,
      startDate: popup.startDate ? popup.startDate.split('T')[0] : '',
      endDate: popup.endDate ? popup.endDate.split('T')[0] : '',
      maxShow: popup.maxShow || undefined,
      targetPages: popup.targetPages || '',
      excludePages: popup.excludePages || '',
      width: popup.width?.toString() || '',
      height: popup.height?.toString() || '',
      backgroundColor: popup.backgroundColor || '#ffffff',
      textColor: popup.textColor || '#000000',
      borderColor: popup.borderColor || '#e5e7eb',
      borderRadius: popup.borderRadius?.toString() || '8',
      zIndex: popup.zIndex.toString(),
      // 에디터 및 이미지 관련 필드
      contentHtml: popup.contentHtml || '',
      images: popup.images || '',
      // 쿠키 관련 필드
      showDontShowToday: popup.showDontShowToday || false,
      cookieExpireHours: popup.cookieExpireHours || 24
    })
    setShowModal(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('정말로 이 팝업을 삭제하시겠습니까?')) return

    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`/api/admin/popups/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      
      if (data.ok) {
        showSuccess('팝업 삭제 완료', '팝업이 삭제되었습니다.')
        loadPopups()
      } else {
        showError('삭제 실패', data.error || '팝업 삭제에 실패했습니다.')
      }
    } catch (error) {
      showError('서버 오류', '서버 오류가 발생했습니다.')
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      type: 'INFO',
      position: 'CENTER',
      size: 'MEDIUM',
      isActive: true,
      startDate: '',
      endDate: '',
      maxShow: undefined,
      targetPages: '',
      excludePages: '',
      width: '',
      height: '',
      backgroundColor: '#ffffff',
      textColor: '#000000',
      borderColor: '#e5e7eb',
      borderRadius: '8',
      zIndex: '1000',
      // 에디터 및 이미지 관련 필드
      contentHtml: '',
      images: '',
      // 쿠키 관련 필드
      showDontShowToday: false,
      cookieExpireHours: 24
    })
  }

  const openModal = () => {
    resetForm()
    setEditingPopup(null)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingPopup(null)
    resetForm()
  }

  const getTypeColor = (type: Popup['type']) => {
    const colors = {
      INFO: 'bg-blue-100 text-blue-800',
      WARNING: 'bg-yellow-100 text-yellow-800',
      SUCCESS: 'bg-green-100 text-green-800',
      ERROR: 'bg-red-100 text-red-800',
      PROMOTION: 'bg-purple-100 text-purple-800',
      NOTICE: 'bg-gray-100 text-gray-800'
    }
    return colors[type]
  }

  if (loading) {
    return (
      <AdminLayout title="팝업 관리" description="사이트에 표시될 팝업을 관리할 수 있습니다.">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">팝업을 불러오는 중...</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="팝업 관리" description="사이트에 표시될 팝업을 관리할 수 있습니다.">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">팝업 관리</h1>
            <p className="text-gray-600">사이트에 표시될 팝업을 생성하고 관리할 수 있습니다.</p>
          </div>
          <button
            onClick={openModal}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            새 팝업 생성
          </button>
        </div>

        {/* 팝업 목록 */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    제목
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    타입
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    위치
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    노출 횟수
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    기간
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    생성일
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {popups.map((popup) => (
                  <tr key={popup.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{popup.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(popup.type)}`}>
                        {popup.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {popup.position}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        popup.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {popup.isActive ? '활성' : '비활성'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {popup.showCount} / {popup.maxShow || '∞'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {popup.startDate && popup.endDate ? (
                        <div>
                          <div>{new Date(popup.startDate).toLocaleDateString()}</div>
                          <div className="text-gray-500">~ {new Date(popup.endDate).toLocaleDateString()}</div>
                        </div>
                      ) : (
                        <span className="text-gray-500">제한 없음</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(popup.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(popup)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleDelete(popup.id)}
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
        </div>

        {/* 팝업 생성/수정 모달 */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {editingPopup ? '팝업 수정' : '새 팝업 생성'}
                  </h3>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="sr-only">닫기</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* 기본 정보 섹션 */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2">기본 정보</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">제목 *</label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="팝업 제목"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">내용 *</label>
                      <textarea
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        rows={3}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="간단한 텍스트 내용"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">HTML 내용</label>
                      <ReactQuillEditor
                        value={formData.contentHtml}
                        onChange={(content) => setFormData({ ...formData, contentHtml: content })}
                        height={300}
                        placeholder="리치 텍스트 에디터 내용 (이미지, 링크 등 포함 가능)"
                      />
                      <p className="mt-2 text-sm text-gray-500">React Quill 에디터를 사용하여 이미지, 링크, 테이블 등을 포함할 수 있습니다.</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">이미지 URL</label>
                      <textarea
                        value={formData.images}
                        onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                        rows={3}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="이미지 URL을 한 줄씩 입력하세요"
                      />
                      <p className="mt-1 text-sm text-gray-500">여러 이미지를 사용할 경우 한 줄씩 입력하세요.</p>
                    </div>
                  </div>

                  {/* 표시 정보 섹션 */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2">표시 정보</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">시작일</label>
                        <input
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">종료일</label>
                        <input
                          type="date"
                          value={formData.endDate}
                          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">최대 노출 횟수</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.maxShow || ''}
                        onChange={(e) => setFormData({ ...formData, maxShow: e.target.value ? parseInt(e.target.value) : undefined })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="제한 없음"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">대상 페이지</label>
                      <input
                        type="text"
                        value={formData.targetPages || ''}
                        onChange={(e) => setFormData({ ...formData, targetPages: e.target.value })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="예: /, /products, /reservation"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">제외 페이지</label>
                      <input
                        type="text"
                        value={formData.excludePages || ''}
                        onChange={(e) => setFormData({ ...formData, excludePages: e.target.value })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="예: /admin, /login"
                      />
                    </div>
                  </div>

                  {/* 팝업 속성 섹션 */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2">팝업 속성</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">타입</label>
                        <select
                          value={formData.type}
                          onChange={(e) => setFormData({ ...formData, type: e.target.value as Popup['type'] })}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="INFO">정보</option>
                          <option value="WARNING">경고</option>
                          <option value="SUCCESS">성공</option>
                          <option value="ERROR">오류</option>
                          <option value="PROMOTION">프로모션</option>
                          <option value="NOTICE">공지</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">위치</label>
                        <select
                          value={formData.position}
                          onChange={(e) => setFormData({ ...formData, position: e.target.value as Popup['position'] })}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="TOP_LEFT">상단 좌측</option>
                          <option value="TOP_CENTER">상단 중앙</option>
                          <option value="TOP_RIGHT">상단 우측</option>
                          <option value="CENTER_LEFT">중앙 좌측</option>
                          <option value="CENTER">중앙</option>
                          <option value="CENTER_RIGHT">중앙 우측</option>
                          <option value="BOTTOM_LEFT">하단 좌측</option>
                          <option value="BOTTOM_CENTER">하단 중앙</option>
                          <option value="BOTTOM_RIGHT">하단 우측</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">크기</label>
                        <select
                          value={formData.size}
                          onChange={(e) => setFormData({ ...formData, size: e.target.value as Popup['size'] })}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="SMALL">작음</option>
                          <option value="MEDIUM">보통</option>
                          <option value="LARGE">큼</option>
                          <option value="FULLSCREEN">전체화면</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                        활성화
                      </label>
                    </div>
                  </div>

                  {/* 쿠키 설정 섹션 */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2">쿠키 설정</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <input
                          id="showDontShowToday"
                          type="checkbox"
                          checked={formData.showDontShowToday}
                          onChange={(e) => setFormData({ ...formData, showDontShowToday: e.target.checked })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="showDontShowToday" className="ml-2 block text-sm text-gray-900">
                          "오늘 하루 보지 않기" 옵션 표시
                        </label>
                      </div>
                      
                      {formData.showDontShowToday && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">쿠키 만료 시간 (시간)</label>
                          <input
                            type="number"
                            min="1"
                            max="168"
                            value={formData.cookieExpireHours}
                            onChange={(e) => setFormData({ ...formData, cookieExpireHours: parseInt(e.target.value) || 24 })}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <p className="mt-1 text-sm text-gray-500">1-168시간 (1주일) 사이로 설정하세요.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 스타일 설정 섹션 */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2">스타일 설정</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">배경색</label>
                        <input
                          type="color"
                          value={formData.backgroundColor}
                          onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                          className="mt-1 block w-full h-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">텍스트 색상</label>
                        <input
                          type="color"
                          value={formData.textColor}
                          onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                          className="mt-1 block w-full h-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">테두리 색상</label>
                        <input
                          type="color"
                          value={formData.borderColor}
                          onChange={(e) => setFormData({ ...formData, borderColor: e.target.value })}
                          className="mt-1 block w-full h-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {formData.size === 'FULLSCREEN' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">너비 (px)</label>
                          <input
                            type="number"
                            value={formData.width}
                            onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">높이 (px)</label>
                          <input
                            type="number"
                            value={formData.height}
                            onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">테두리 반경 (px)</label>
                        <input
                          type="number"
                          value={formData.borderRadius}
                          onChange={(e) => setFormData({ ...formData, borderRadius: e.target.value })}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Z-Index</label>
                        <input
                          type="number"
                          value={formData.zIndex}
                          onChange={(e) => setFormData({ ...formData, zIndex: e.target.value })}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 버튼 */}
                  <div className="flex justify-end space-x-3 pt-6 border-t">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? '저장 중...' : (editingPopup ? '수정' : '생성')}
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
