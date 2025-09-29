import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminToken } from '@/lib/auth'

// 컨텐츠 목록 조회
export async function GET(request: NextRequest) {
  try {
    const result = await verifyAdminToken(request)
    if (!result.ok || !result.payload || (result.payload.role !== 'ADMIN' && result.payload.role !== 'SUPER_ADMIN' && result.payload.role !== 'EDITOR')) {
      return NextResponse.json({
        ok: false,
        error: '관리자 권한이 필요합니다.',
      }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''

    const skip = (page - 1) * limit

    // 검색 조건
    const where: any = {}
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { slug: { contains: search } },
        { contentText: { contains: search } }
      ]
    }
    if (status) {
      if (status === 'published') {
        where.isPublished = true
      } else if (status === 'draft') {
        where.isPublished = false
      } else if (status === 'active') {
        where.isActive = true
      } else if (status === 'inactive') {
        where.isActive = false
      }
    }

    const [contents, total] = await Promise.all([
      prisma.content.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          slug: true,
          isActive: true,
          isPublished: true,
          publishedAt: true,
          createdAt: true,
          updatedAt: true,
        }
      }),
      prisma.content.count({ where })
    ])

    return NextResponse.json({
      ok: true,
      data: {
        contents,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error('Contents fetch error:', error)
    return NextResponse.json({
      ok: false,
      error: '컨텐츠 목록을 불러오는 중 오류가 발생했습니다.',
    }, { status: 500 })
  }
}

// 새 컨텐츠 생성
export async function POST(request: NextRequest) {
  try {
    const result = await verifyAdminToken(request)
    if (!result.ok || !result.payload || (result.payload.role !== 'ADMIN' && result.payload.role !== 'SUPER_ADMIN' && result.payload.role !== 'EDITOR')) {
      return NextResponse.json({
        ok: false,
        error: '관리자 권한이 필요합니다.',
      }, { status: 403 })
    }

    const body = await request.json()
    const { title, slug, content, description, keywords, isActive, isPublished } = body

    // 필수 필드 검증
    if (!title || !slug || !content) {
      return NextResponse.json({
        ok: false,
        error: '제목, 슬러그, 내용은 필수입니다.',
      }, { status: 400 })
    }

    // 슬러그 중복 검사
    const existingContent = await prisma.content.findUnique({
      where: { slug }
    })

    if (existingContent) {
      return NextResponse.json({
        ok: false,
        error: '이미 사용 중인 슬러그입니다.',
      }, { status: 400 })
    }

    // HTML에서 텍스트 추출 (간단한 방법)
    const contentText = content.replace(/<[^>]*>/g, '').trim()

    const newContent = await prisma.content.create({
      data: {
        title,
        slug,
        content,
        contentText,
        description,
        keywords,
        isActive: isActive ?? true,
        isPublished: isPublished ?? false,
        publishedAt: isPublished ? new Date() : null
      }
    })

    return NextResponse.json({
      ok: true,
      data: newContent
    })
  } catch (error) {
    console.error('Content creation error:', error)
    return NextResponse.json({
      ok: false,
      error: '컨텐츠 생성 중 오류가 발생했습니다.',
    }, { status: 500 })
  }
}
