'use client'

import { useState, useEffect } from 'react'

interface ContentEditorProps {
  onSubmit: (data: any) => void
  loading: boolean
  initialData?: {
    id?: number
    title: string
    slug: string
    content: string
    description?: string | null
    keywords?: string | null
    isActive: boolean
    isPublished: boolean
  } | null
}

export default function ContentEditor({ onSubmit, loading, initialData }: ContentEditorProps) {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    description: '',
    keywords: '',
    isActive: true,
    isPublished: false
  })

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        slug: initialData.slug,
        content: initialData.content,
        description: initialData.description || '',
        keywords: initialData.keywords || '',
        isActive: initialData.isActive,
        isPublished: initialData.isPublished
      })
    }
  }, [initialData])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // 슬러그 자동 생성 (한글, 공백, 특수문자 제거)
    const slug = value
      .toLowerCase()
      .replace(/[가-힣]/g, '') // 한글 제거
      .replace(/[^a-z0-9\s-]/g, '') // 특수문자 제거
      .replace(/\s+/g, '-') // 공백을 하이픈으로
      .replace(/-+/g, '-') // 연속된 하이픈을 하나로
      .replace(/^-|-$/g, '') // 앞뒤 하이픈 제거

    setFormData(prev => ({
      ...prev,
      slug
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* 제목 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            제목 *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="컨텐츠 제목을 입력하세요"
          />
        </div>

        {/* 슬러그 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            슬러그 (URL) *
          </label>
          <div className="flex">
            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
              /
            </span>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleSlugChange}
              required
              className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="url-slug"
            />
          </div>
          <p className="mt-1 text-sm text-gray-500">
            URL에 사용될 슬러그입니다. 영문, 숫자, 하이픈만 사용 가능합니다.
          </p>
        </div>

        {/* 내용 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            내용 *
          </label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            required
            rows={15}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="컨텐츠 내용을 입력하세요 (HTML 태그 사용 가능)"
          />
          <p className="mt-1 text-sm text-gray-500">
            HTML 태그를 사용하여 내용을 작성할 수 있습니다.
          </p>
        </div>

        {/* 메타 설명 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            메타 설명
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="SEO를 위한 메타 설명을 입력하세요"
          />
        </div>

        {/* 메타 키워드 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            메타 키워드
          </label>
          <input
            type="text"
            name="keywords"
            value={formData.keywords}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="키워드1, 키워드2, 키워드3"
          />
        </div>

        {/* 설정 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">활성화</span>
            </label>
            <p className="mt-1 text-sm text-gray-500">
              비활성화된 컨텐츠는 사용자에게 표시되지 않습니다.
            </p>
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="isPublished"
                checked={formData.isPublished}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">발행</span>
            </label>
            <p className="mt-1 text-sm text-gray-500">
              발행된 컨텐츠만 사용자에게 공개됩니다.
            </p>
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex justify-end gap-4 pt-6 border-t">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '저장 중...' : '저장'}
          </button>
        </div>
      </form>
    </div>
  )
}
