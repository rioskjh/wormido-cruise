'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import AdminLayout from '@/components/AdminLayout'
import ReactQuillEditor from '@/components/ReactQuillEditor'

interface Post {
  id: number
  type: 'NOTICE' | 'EVENT' | 'REVIEW' | 'FAQ' | 'QNA'
  title: string
  contentHtml: string
  isNotice: boolean
  isSecret: boolean
  authorName: string | null
  views: number
  createdAt: string
  updatedAt: string
  author?: {
    id: number
    username: string
  }
  files?: any[]
}

interface PostFormData {
  type: 'NOTICE' | 'EVENT' | 'REVIEW' | 'FAQ' | 'QNA'
  title: string
  contentHtml: string
  isNotice: boolean
  isSecret: boolean
  authorName: string
  qnaPassword: string
}

export default function AdminBoardEditPage() {
  const router = useRouter()
  const params = useParams()
  const [post, setPost] = useState<Post | null>(null)
  const [formData, setFormData] = useState<PostFormData>({
    type: 'NOTICE',
    title: '',
    contentHtml: '',
    isNotice: false,
    isSecret: false,
    authorName: '',
    qnaPassword: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const boardTypes = [
    { key: 'NOTICE', name: '공지사항', icon: '📢', description: '중요한 공지사항을 작성합니다.' },
    { key: 'EVENT', name: '이벤트', icon: '🎉', description: '이벤트 정보를 작성합니다.' },
    { key: 'REVIEW', name: '⭐', icon: '⭐', description: '고객 리뷰를 작성합니다.' },
    { key: 'FAQ', name: 'FAQ', icon: '❓', description: '자주 묻는 질문을 작성합니다.' },
    { key: 'QNA', name: 'Q&A', icon: '💬', description: '질문과 답변을 작성합니다.' }
  ] as const

  const currentBoardType = boardTypes.find(bt => bt.key === formData.type)

  useEffect(() => {
    if (params.id) {
      fetchPost()
    }
  }, [params.id])

  const fetchPost = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`/api/admin/posts/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        const postData = data.post
        
        setPost(postData)
        setFormData({
          type: postData.type,
          title: postData.title,
          contentHtml: postData.contentHtml,
          isNotice: postData.isNotice,
          isSecret: postData.isSecret,
          authorName: postData.authorName || '',
          qnaPassword: '' // 비밀번호는 다시 입력받음
        })
      } else {
        const error = await response.json()
        alert(error.error || '게시글을 불러올 수 없습니다.')
        router.push('/admin/board')
      }
    } catch (error) {
      console.error('게시글 조회 오류:', error)
      alert('게시글 조회 중 오류가 발생했습니다.')
      router.push('/admin/board')
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = '제목을 입력해주세요.'
    }

    if (!formData.contentHtml.trim()) {
      newErrors.content = '내용을 입력해주세요.'
    }

    if (formData.type === 'QNA' && !formData.authorName.trim()) {
      newErrors.authorName = '작성자명을 입력해주세요.'
    }

    if (formData.type === 'QNA' && formData.isSecret && !formData.qnaPassword.trim()) {
      newErrors.qnaPassword = '비밀번호를 입력해주세요.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setSaving(true)

    try {
      const submitData: any = {
        title: formData.title,
        contentHtml: formData.contentHtml,
        isNotice: formData.isNotice,
        isSecret: formData.isSecret
      }

      // QnA인 경우 추가 필드
      if (formData.type === 'QNA') {
        submitData.authorName = formData.authorName
        if (formData.isSecret && formData.qnaPassword) {
          // 실제로는 서버에서 bcrypt로 해싱해야 함
          submitData.qnaPasswordHash = formData.qnaPassword
        }
      }

      const token = localStorage.getItem('adminToken')
      const response = await fetch(`/api/admin/posts/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submitData)
      })

      if (response.ok) {
        alert('게시글이 성공적으로 수정되었습니다.')
        router.push('/admin/board')
      } else {
        const error = await response.json()
        alert(error.error || '게시글 수정에 실패했습니다.')
      }
    } catch (error) {
      console.error('게시글 수정 오류:', error)
      alert('게시글 수정 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof PostFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // 에러 메시지 제거
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  if (loading) {
    return (
      <AdminLayout title="게시글 수정" description="게시글을 수정합니다.">
        <div>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">게시글을 불러오는 중...</p>
            </div>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (!post) {
    return (
      <AdminLayout title="게시글 수정" description="게시글을 수정합니다.">
        <div>
          <div className="text-center">
            <p className="text-gray-600">게시글을 찾을 수 없습니다.</p>
            <button
              onClick={() => router.push('/admin/board')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              목록으로 돌아가기
            </button>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="게시글 수정" description="게시글을 수정합니다.">
      <div>
        {/* 헤더 */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">
                {currentBoardType?.icon} {currentBoardType?.name} - {currentBoardType?.description}
              </p>
            </div>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← 목록으로
            </button>
          </div>
        </div>

        {/* 작성 폼 */}
        <div className="bg-white rounded-lg shadow border">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* 게시판 타입 (읽기 전용) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                게시판 타입
              </label>
              <div className="p-3 border border-gray-300 rounded-lg bg-gray-50">
                <div className="flex items-center">
                  <span className="text-lg mr-2">{currentBoardType?.icon}</span>
                  <div>
                    <div className="font-medium">{currentBoardType?.name}</div>
                    <div className="text-xs text-gray-500">{currentBoardType?.description}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 제목 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                제목 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="제목을 입력해주세요"
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
            </div>

            {/* QnA 작성자명 */}
            {formData.type === 'QNA' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  작성자명 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.authorName}
                  onChange={(e) => handleInputChange('authorName', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.authorName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="작성자명을 입력해주세요"
                />
                {errors.authorName && <p className="mt-1 text-sm text-red-600">{errors.authorName}</p>}
              </div>
            )}

            {/* 내용 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                내용 <span className="text-red-500">*</span>
              </label>
              <div className={`border rounded-md ${errors.content ? 'border-red-500' : 'border-gray-300'}`}>
                <ReactQuillEditor
                  value={formData.contentHtml}
                  onChange={(value) => handleInputChange('contentHtml', value)}
                  placeholder="내용을 입력해주세요"
                />
              </div>
              {errors.content && <p className="mt-1 text-sm text-red-600">{errors.content}</p>}
            </div>

            {/* 옵션 */}
            <div className="space-y-4">
              <div className="flex items-center space-x-6">
                {/* 공지 등록 (공지사항만) */}
                {formData.type === 'NOTICE' && (
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isNotice}
                      onChange={(e) => handleInputChange('isNotice', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">공지로 등록</span>
                  </label>
                )}

                {/* 비밀글 (QnA만) */}
                {formData.type === 'QNA' && (
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isSecret}
                      onChange={(e) => handleInputChange('isSecret', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">비밀글</span>
                  </label>
                )}
              </div>

              {/* QnA 비밀번호 */}
              {formData.type === 'QNA' && formData.isSecret && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    비밀번호 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={formData.qnaPassword}
                    onChange={(e) => handleInputChange('qnaPassword', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.qnaPassword ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="비밀번호를 입력해주세요"
                  />
                  {errors.qnaPassword && <p className="mt-1 text-sm text-red-600">{errors.qnaPassword}</p>}
                </div>
              )}
            </div>

            {/* 게시글 정보 */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-2">게시글 정보</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">작성자:</span>
                  <span className="ml-1 font-medium">{post.author?.username || post.authorName || '비회원'}</span>
                </div>
                <div>
                  <span className="text-gray-500">조회수:</span>
                  <span className="ml-1 font-medium">{post.views.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-500">작성일:</span>
                  <span className="ml-1 font-medium">
                    {new Date(post.createdAt).toLocaleDateString('ko-KR')}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">수정일:</span>
                  <span className="ml-1 font-medium">
                    {new Date(post.updatedAt).toLocaleDateString('ko-KR')}
                  </span>
                </div>
              </div>
            </div>

            {/* 버튼 */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? '수정 중...' : '게시글 수정'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  )
}
