'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import SubPageLayout from '@/components/SubPageLayout'

interface Content {
  id: number
  title: string
  slug: string
  content: string
  description: string | null
  keywords: string | null
  publishedAt: string
  updatedAt: string
}

function ContentsPageContent() {
  const searchParams = useSearchParams()
  const slug = searchParams.get('slug')
  
  const [content, setContent] = useState<Content | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) {
      setError('컨텐츠를 찾을 수 없습니다.')
      setLoading(false)
      return
    }

    const fetchContent = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/contents/${slug}`)
        
        if (!response.ok) {
          throw new Error('컨텐츠를 찾을 수 없습니다.')
        }
        
        const data = await response.json()
        
        if (data.ok) {
          setContent(data.data)
        } else {
          throw new Error(data.error || '컨텐츠를 불러오는 중 오류가 발생했습니다.')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchContent()
  }, [slug])

  if (loading) {
    return (
      <SubPageLayout title="로딩 중...">
        <div className="flex justify-center items-center py-20">
          <div className="text-gray-500">컨텐츠를 불러오는 중...</div>
        </div>
      </SubPageLayout>
    )
  }

  if (error || !content) {
    return (
      <SubPageLayout title="컨텐츠를 찾을 수 없습니다">
        <div className="flex justify-center items-center py-20">
          <div className="text-red-500">{error || '컨텐츠를 찾을 수 없습니다.'}</div>
        </div>
      </SubPageLayout>
    )
  }

  return (
    <SubPageLayout title={content.title}>
      <article className="w-full">
        {/* 컨텐츠 내용 */}
        <div className="prose prose-lg max-w-none w-full">
          <div 
            dangerouslySetInnerHTML={{ __html: content.content }}
            className="content-body"
          />
        </div>
      </article>
    </SubPageLayout>
  )
}

export default function ContentsPage() {
  return (
    <Suspense fallback={
      <SubPageLayout title="로딩 중...">
        <div className="flex justify-center items-center py-20">
          <div className="text-gray-500">컨텐츠를 불러오는 중...</div>
        </div>
      </SubPageLayout>
    }>
      <ContentsPageContent />
    </Suspense>
  )
}
