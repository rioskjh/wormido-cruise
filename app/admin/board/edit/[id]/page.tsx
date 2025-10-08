'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import AdminLayout from '@/components/AdminLayout'
import CKEditor5 from '@/components/CKEditor5'
import { useToast } from '@/contexts/ToastContext'

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

interface PostFile {
  id: number
  filename: string
  size: number
  url: string
}

export default function AdminBoardEditPage() {
  const router = useRouter()
  const params = useParams() as { id: string }
  const { showSuccess, showError } = useToast()
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
  const [uploadingFiles, setUploadingFiles] = useState<boolean[]>([])
  const [uploadedFiles, setUploadedFiles] = useState<PostFile[]>([])
  const [existingFiles, setExistingFiles] = useState<PostFile[]>([])

  const boardTypes = [
    { key: 'NOTICE', name: '공지사항', icon: '📢', description: '중요한 공지사항을 작성합니다.' },
    { key: 'EVENT', name: '이벤트', icon: '🎉', description: '이벤트 정보를 작성합니다.' },
    { key: 'REVIEW', name: '⭐', icon: '⭐', description: '고객 리뷰를 작성합니다.' },
    { key: 'FAQ', name: 'FAQ', icon: '❓', description: '자주 묻는 질문을 작성합니다.' },
    { key: 'QNA', name: 'Q&A', icon: '💬', description: '질문과 답변을 작성합니다.' }
  ] as const

  const currentBoardType = boardTypes.find(bt => bt.key === formData.type)

  const fetchPost = useCallback(async () => {
    if (!params?.id) return
    
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

        // 기존 첨부파일 로드
        if (postData.files && postData.files.length > 0) {
          setExistingFiles(postData.files.map((file: any) => ({
            id: file.id,
            filename: file.filename,
            size: file.size,
            url: file.url
          })))
        }
      } else {
        const error = await response.json()
        alert(error.error || '게시글을 불러올 수 없습니다.')
        router.push(`/admin/board?type=${formData.type}`)
      }
    } catch (error) {
      console.error('게시글 조회 오류:', error)
      alert('게시글 조회 중 오류가 발생했습니다.')
      router.push(`/admin/board?type=${formData.type}`)
    } finally {
      setLoading(false)
    }
  }, [params?.id, router])

  // 컴포넌트 마운트 시 게시글 데이터 로드
  useEffect(() => {
    if (params?.id) {
      fetchPost()
    }
  }, [params?.id, fetchPost])

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
        // 새로 추가된 첨부파일이 있으면 업로드
        if (uploadedFiles.length > 0) {
          await uploadFilesToPost(parseInt(params.id))
        }
        
        showSuccess('게시글 수정 완료', '게시글이 성공적으로 수정되었습니다.')
        router.push(`/admin/board?type=${formData.type}`)
      } else {
        const error = await response.json()
        showError('게시글 수정 실패', error.error || '게시글 수정에 실패했습니다.')
      }
    } catch (error) {
      console.error('게시글 수정 오류:', error)
      showError('게시글 수정 오류', '게시글 수정 중 오류가 발생했습니다.')
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

  const handleFileUpload = async (files: FileList) => {
    const fileArray = Array.from(files)
    
    // 파일 개수 제한 (최대 5개)
    if (existingFiles.length + uploadedFiles.length + fileArray.length > 5) {
      alert('첨부파일은 최대 5개까지 업로드할 수 있습니다.')
      return
    }

    // 파일 크기 검증 (5MB 제한)
    for (const file of fileArray) {
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} 파일의 크기가 5MB를 초과합니다.`)
        return
      }
    }

    // 임시로 파일 정보 저장 (게시글 수정 후 실제 업로드)
    const newFiles: PostFile[] = fileArray.map((file, index) => ({
      id: Date.now() + index, // 임시 ID
      filename: file.name,
      size: file.size,
      url: URL.createObjectURL(file)
    }))

    setUploadedFiles(prev => [...prev, ...newFiles])
  }

  const uploadFilesToPost = async (postId: number) => {
    const token = localStorage.getItem('adminToken')
    
    for (const file of uploadedFiles) {
      try {
        // 임시 URL에서 실제 파일 가져오기
        const response = await fetch(file.url)
        const blob = await response.blob()
        const actualFile = new File([blob], file.filename, { type: blob.type })

        const formData = new FormData()
        formData.append('file', actualFile)

        await fetch(`/api/admin/posts/${postId}/files`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        })
      } catch (error) {
        console.error('파일 업로드 오류:', error)
      }
    }
  }

  const removeNewFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const removeExistingFile = async (fileId: number) => {
    if (!confirm('첨부파일을 삭제하시겠습니까?')) return

    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`/api/admin/posts/${params.id}/files/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setExistingFiles(prev => prev.filter(file => file.id !== fileId))
        showSuccess('첨부파일 삭제 완료', '첨부파일이 삭제되었습니다.')
      } else {
        showError('첨부파일 삭제 실패', '첨부파일 삭제에 실패했습니다.')
      }
    } catch (error) {
      console.error('파일 삭제 오류:', error)
      showError('첨부파일 삭제 오류', '첨부파일 삭제 중 오류가 발생했습니다.')
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
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
              onClick={() => router.push(`/admin/board?type=${formData.type}`)}
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
              onClick={() => router.push(`/admin/board?type=${formData.type}`)}
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
                <CKEditor5
                  value={formData.contentHtml}
                  onChange={(value) => handleInputChange('contentHtml', value)}
                  placeholder="내용을 입력해주세요"
                />
              </div>
              {errors.content && <p className="mt-1 text-sm text-red-600">{errors.content}</p>}
            </div>

            {/* 첨부파일 */}
            {(formData.type === 'NOTICE' || formData.type === 'EVENT' || formData.type === 'REVIEW' || formData.type === 'QNA') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  첨부파일 (최대 5개, 파일당 5MB)
                </label>
                
                {/* 기존 첨부파일 */}
                {existingFiles.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">기존 첨부파일</h4>
                    <div className="space-y-2">
                      {existingFiles.map((file) => (
                        <div key={file.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center">
                            <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{file.filename}</p>
                              <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={async () => {
                                try {
                                  const token = localStorage.getItem('adminToken')
                                  const downloadUrl = `/api/admin/posts/${params.id}/files/${file.id}/download`
                                  
                                  const response = await fetch(downloadUrl, {
                                    headers: {
                                      'Authorization': `Bearer ${token}`
                                    }
                                  })
                                  
                                  if (response.ok) {
                                    const blob = await response.blob()
                                    const url = window.URL.createObjectURL(blob)
                                    const link = document.createElement('a')
                                    link.href = url
                                    link.download = file.filename
                                    document.body.appendChild(link)
                                    link.click()
                                    document.body.removeChild(link)
                                    window.URL.revokeObjectURL(url)
                                  } else {
                                    showError('다운로드 실패', '파일 다운로드에 실패했습니다.')
                                  }
                                } catch (error) {
                                  console.error('다운로드 오류:', error)
                                  showError('다운로드 오류', '파일 다운로드 중 오류가 발생했습니다.')
                                }
                              }}
                              className="text-blue-500 hover:text-blue-700 p-1"
                              title="다운로드"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => removeExistingFile(file.id)}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 새 파일 업로드 */}
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6"
                  onDrop={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                      handleFileUpload(e.dataTransfer.files)
                    }
                  }}
                  onDragOver={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                  onDragEnter={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                >
                  <input
                    type="file"
                    multiple
                    onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                    className="hidden"
                    id="file-upload-edit"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar,.7z,.jpg,.jpeg,.png,.gif"
                  />
                  <label
                    htmlFor="file-upload-edit"
                    className="cursor-pointer flex flex-col items-center justify-center text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span className="text-sm">파일을 선택하거나 여기에 드래그하세요</span>
                    <span className="text-xs text-gray-400 mt-1">PDF, DOC, XLS, PPT, TXT, ZIP, 이미지 파일</span>
                  </label>
                </div>
                
                {/* 새로 업로드된 파일 목록 */}
                {uploadedFiles.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">새로 추가할 파일</h4>
                    <div className="space-y-2">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
                          <div className="flex items-center">
                            <svg className="w-5 h-5 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{file.filename}</p>
                              <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeNewFile(index)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

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
