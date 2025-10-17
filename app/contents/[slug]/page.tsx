import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import SubPageLayout from '@/components/SubPageLayout'
import './content-styles.css'

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

interface PageProps {
  params: { slug: string }
}

async function getContent(slug: string): Promise<Content | null> {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/contents/${slug}`, {
      cache: 'no-store' // 실시간 데이터를 위해 캐시 비활성화
    })
    
    if (!response.ok) {
      return null
    }
    
    const data = await response.json()
    return data.ok ? data.data : null
  } catch (error) {
    console.error('Content fetch error:', error)
    return null
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const content = await getContent(params.slug)
  
  if (!content) {
    return {
      title: '컨텐츠를 찾을 수 없습니다',
    }
  }

  return {
    title: content.title,
    description: content.description || content.title,
    keywords: content.keywords || undefined,
    openGraph: {
      title: content.title,
      description: content.description || content.title,
      type: 'article',
      publishedTime: content.publishedAt,
      modifiedTime: content.updatedAt,
    },
  }
}

export default async function ContentPage({ params }: PageProps) {
  const content = await getContent(params.slug)

  if (!content) {
    notFound()
  }

  return (
    <SubPageLayout title={content.title}>
      <article className="w-full">
        {/* 메타 정보 */}
        <div className="flex items-center text-sm text-gray-500 space-x-4 mb-8">
          <time dateTime={content.publishedAt}>
            발행일: {new Date(content.publishedAt).toLocaleDateString('ko-KR')}
          </time>
          <time dateTime={content.updatedAt}>
            수정일: {new Date(content.updatedAt).toLocaleDateString('ko-KR')}
          </time>
        </div>

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
