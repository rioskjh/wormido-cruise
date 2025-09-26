'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import AdminLayout from '@/components/AdminLayout'
import ReactQuillEditor from '@/components/ReactQuillEditor'

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

function AdminBoardWritePageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState<PostFormData>({
    type: (searchParams.get('type') as 'NOTICE' | 'EVENT' | 'REVIEW' | 'FAQ' | 'QNA') || 'NOTICE',
    title: '',
    contentHtml: '',
    isNotice: false,
    isSecret: false,
    authorName: '',
    qnaPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [uploadingFiles, setUploadingFiles] = useState<boolean[]>([])
  const [uploadedFiles, setUploadedFiles] = useState<PostFile[]>([])
  const [createdPostId, setCreatedPostId] = useState<number | null>(null)

  const boardTypes = [
    { key: 'NOTICE', name: '공지사항', icon: '📢', description: '중요한 공지사항을 작성합니다.' },
    { key: 'EVENT', name: '이벤트', icon: '🎉', description: '이벤트 정보를 작성합니다.' },
    { key: 'REVIEW', name: '리뷰', icon: '⭐', description: '고객 리뷰를 작성합니다.' },
    { key: 'FAQ', name: 'FAQ', icon: '❓', description: '자주 묻는 질문을 작성합니다.' },
    { key: 'QNA', name: 'Q&A', icon: '💬', description: '질문과 답변을 작성합니다.' }
  ] as const

  const currentBoardType = boardTypes.find(bt => bt.key === formData.type)

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

    setLoading(true)

    try {
      const submitData: any = {
        type: formData.type,
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
      const response = await fetch('/api/admin/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submitData)
      })

      if (response.ok) {
        const result = await response.json()
        setCreatedPostId(result.post.id)
        
        // 첨부파일이 있으면 업로드
        if (uploadedFiles.length > 0 && result.post.id) {
          await uploadFilesToPost(result.post.id)
        }
        
        alert('게시글이 성공적으로 작성되었습니다.')
        router.push('/admin/board')
      } else {
        const error = await response.json()
        alert(error.error || '게시글 작성에 실패했습니다.')
      }
    } catch (error) {
      console.error('게시글 작성 오류:', error)
      alert('게시글 작성 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
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
    if (uploadedFiles.length + fileArray.length > 5) {
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

    // 임시로 파일 정보 저장 (게시글 생성 후 실제 업로드)
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

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <AdminLayout title="게시글 작성" description="새로운 게시글을 작성합니다.">
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
            {/* 게시판 타입 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                게시판 타입
              </label>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {boardTypes.map((boardType) => (
                  <button
                    key={boardType.key}
                    type="button"
                    onClick={() => handleInputChange('type', boardType.key)}
                    className={`p-3 border rounded-lg text-left transition-colors ${
                      formData.type === boardType.key
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="text-lg mr-2">{boardType.icon}</span>
                      <div>
                        <div className="font-medium">{boardType.name}</div>
                        <div className="text-xs text-gray-500">{boardType.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
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

            {/* 첨부파일 */}
            {(formData.type === 'NOTICE' || formData.type === 'EVENT' || formData.type === 'REVIEW' || formData.type === 'QNA') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  첨부파일 (최대 5개, 파일당 5MB)
                </label>
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
                    id="file-upload"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar,.7z,.jpg,.jpeg,.png,.gif"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center justify-center text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span className="text-sm">파일을 선택하거나 여기에 드래그하세요</span>
                    <span className="text-xs text-gray-400 mt-1">PDF, DOC, XLS, PPT, TXT, ZIP, 이미지 파일</span>
                  </label>
                </div>
                
                {/* 업로드된 파일 목록 */}
                {uploadedFiles.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">업로드된 파일</h4>
                    <div className="space-y-2">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center">
                            <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{file.filename}</p>
                              <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
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
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? '작성 중...' : '게시글 작성'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  )
}

export default function AdminBoardWritePage() {
  return (
    <Suspense fallback={
      <AdminLayout title="게시글 작성" description="새로운 게시글을 작성합니다.">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">로딩 중...</p>
          </div>
        </div>
      </AdminLayout>
    }>
      <AdminBoardWritePageContent />
    </Suspense>
  )
}
