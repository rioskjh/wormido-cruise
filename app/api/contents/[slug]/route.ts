import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getNoCacheHeaders } from '@/lib/cache-headers'

// 동적 렌더링 강제
export const dynamic = 'force-dynamic'
export const revalidate = 0

// 공개 컨텐츠 조회 (사용자용)
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    const content = await prisma.content.findFirst({
      where: {
        slug,
        isActive: true,
        isPublished: true
      },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        description: true,
        keywords: true,
        publishedAt: true,
        updatedAt: true
      }
    })

    if (!content) {
      return NextResponse.json({
        ok: false,
        error: '컨텐츠를 찾을 수 없습니다.',
      }, { status: 404 })
    }

    return NextResponse.json({
      ok: true,
      data: content,
      timestamp: new Date().toISOString()
    }, {
      headers: getNoCacheHeaders()
    })
  } catch (error) {
    console.error('Public content fetch error:', error)
    return NextResponse.json({
      ok: false,
      error: '컨텐츠를 불러오는 중 오류가 발생했습니다.',
    }, { status: 500 })
  }
}
