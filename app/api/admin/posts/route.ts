import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminToken } from '@/lib/admin-auth'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const createPostSchema = z.object({
  type: z.enum(['NOTICE', 'EVENT', 'REVIEW', 'FAQ', 'QNA']),
  title: z.string().min(1, '제목을 입력해주세요'),
  contentHtml: z.string().min(1, '내용을 입력해주세요'),
  isNotice: z.boolean().optional().default(false),
  isSecret: z.boolean().optional().default(false),
  authorName: z.string().optional(),
  qnaPasswordHash: z.string().optional(),
})

// GET: 게시글 목록 조회
export async function GET(request: NextRequest) {
  try {
    // 관리자 인증 확인
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ ok: false, error: '인증 토큰이 필요합니다.' }, { status: 401 })
    }

    const mockRequest = new NextRequest('http://localhost', {
      headers: { authorization: `Bearer ${token}` }
    })
    const admin = await verifyAdminToken(mockRequest)
    if (!admin) {
      return NextResponse.json({ ok: false, error: '유효하지 않은 토큰입니다.' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') as 'NOTICE' | 'EVENT' | 'REVIEW' | 'FAQ' | 'QNA' | null
    const search = searchParams.get('search') || ''
    const sort = searchParams.get('sort') || 'latest'

    // 검색 조건
    const where: any = {}
    
    if (type) {
      where.type = type
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { contentText: { contains: search, mode: 'insensitive' } }
      ]
    }

    // 정렬 조건 - 공지사항 우선, 그 다음 일반 정렬
    let orderBy: any = [
      { isNotice: 'desc' }, // 공지사항 먼저
      { createdAt: 'desc' }  // 그 다음 최신순
    ]
    
    if (sort === 'views') {
      orderBy = [
        { isNotice: 'desc' }, // 공지사항 먼저
        { views: 'desc' }     // 그 다음 조회수순
      ]
    } else if (sort === 'title') {
      orderBy = [
        { isNotice: 'desc' }, // 공지사항 먼저
        { title: 'asc' }      // 그 다음 제목순
      ]
    }

    const posts = await prisma.post.findMany({
      where,
      orderBy,
      include: {
        author: {
          select: {
            id: true,
            username: true,
          }
        }
      }
    })

    return NextResponse.json({
      ok: true,
      posts
    })

  } catch (error) {
    console.error('게시글 목록 조회 오류:', error)
    return NextResponse.json({
      ok: false,
      error: '게시글 목록 조회 중 오류가 발생했습니다.'
    }, { status: 500 })
  }
}

// POST: 새 게시글 생성
export async function POST(request: NextRequest) {
  try {
    // 관리자 인증 확인
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ ok: false, error: '인증 토큰이 필요합니다.' }, { status: 401 })
    }

    const mockRequest = new NextRequest('http://localhost', {
      headers: { authorization: `Bearer ${token}` }
    })
    const admin = await verifyAdminToken(mockRequest)
    if (!admin) {
      return NextResponse.json({ ok: false, error: '유효하지 않은 토큰입니다.' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createPostSchema.parse(body)

    // HTML에서 텍스트 추출 (검색용)
    const contentText = validatedData.contentHtml.replace(/<[^>]*>/g, '').trim()

    const post = await prisma.post.create({
      data: {
        type: validatedData.type,
        title: validatedData.title,
        contentHtml: validatedData.contentHtml,
        contentText: contentText,
        isNotice: validatedData.isNotice,
        isSecret: validatedData.isSecret,
        authorId: admin.id,
        authorName: validatedData.authorName,
        qnaPasswordHash: validatedData.qnaPasswordHash,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
          }
        }
      }
    })

    return NextResponse.json({
      ok: true,
      post
    }, { status: 201 })

  } catch (error) {
    console.error('게시글 생성 오류:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        ok: false,
        error: error.errors[0].message
      }, { status: 400 })
    }

    return NextResponse.json({
      ok: false,
      error: '게시글 생성 중 오류가 발생했습니다.'
    }, { status: 500 })
  }
}
