'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/AdminLayout'
import ContentEditor from '@/components/ContentEditor'

export default function CreateContentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (formData: any) => {
    try {
      setLoading(true)
      setError('')

      const adminToken = localStorage.getItem('adminToken')
      const response = await fetch('/api/admin/contents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
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
      setError('컨텐츠 생성 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout title="새 컨텐츠 작성">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">새 컨텐츠 작성</h1>
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

        <ContentEditor
          onSubmit={handleSubmit}
          loading={loading}
          initialData={null}
        />
      </div>
    </AdminLayout>
  )
}
