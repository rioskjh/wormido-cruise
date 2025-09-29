'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import AdminLayout from '@/components/AdminLayout'
import ContentEditor from '@/components/ContentEditor'

interface Content {
  id: number
  title: string
  slug: string
  content: string
  description: string | null
  keywords: string | null
  isActive: boolean
  isPublished: boolean
}

export default function EditContentPage() {
  const router = useRouter()
  const params = useParams()
  const [content, setContent] = useState<Content | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (params.id) {
      fetchContent()
    }
  }, [params.id])

  const fetchContent = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/contents/${params.id}`)
      const data = await response.json()

      if (data.ok) {
        setContent(data.data)
      } else {
        setError(data.error)
      }
    } catch (error) {
      setError('컨텐츠를 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (formData: any) => {
    try {
      setSubmitLoading(true)
      setError('')

      const response = await fetch(`/api/admin/contents/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.ok) {
        router.push('/admin/contents')
      } else {
        setError(data.error)
      }
    } catch (error) {
      setError('컨텐츠 수정 중 오류가 발생했습니다.')
    } finally {
      setSubmitLoading(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout title="컨텐츠 수정">
        <div className="p-6">
          <div className="flex justify-center items-center h-64">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">로딩 중...</span>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (error && !content) {
    return (
      <AdminLayout title="컨텐츠 수정">
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
          <button
            onClick={() => router.back()}
            className="mt-4 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            목록으로
          </button>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="컨텐츠 수정">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">컨텐츠 수정</h1>
          <button
            onClick={() => router.back()}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            목록으로
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {content && (
          <ContentEditor
            onSubmit={handleSubmit}
            loading={submitLoading}
            initialData={content}
          />
        )}
      </div>
    </AdminLayout>
  )
}
