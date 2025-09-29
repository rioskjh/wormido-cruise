import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET: 게시판별 게시글 목록 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { boardId: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const skip = (page - 1) * limit

    // 게시판 타입 매핑
    const boardTypeMap: { [key: string]: 'NOTICE' | 'EVENT' | 'REVIEW' | 'FAQ' | 'QNA' } = {
      'notice': 'NOTICE',
      'event': 'EVENT', 
      'review': 'REVIEW',
      'faq': 'FAQ',
      'qna': 'QNA'
    }

    const boardType = boardTypeMap[params.boardId]
    if (!boardType) {
      return NextResponse.json({
        ok: false,
        error: '존재하지 않는 게시판입니다.'
      }, { status: 404 })
    }

    // 데이터베이스에서 게시판 정보 조회
    const board = await prisma.board.findUnique({
      where: { boardId: params.boardId },
      select: {
        id: true,
        boardId: true,
        title: true,
        description: true,
        type: true,
        isAdminOnly: true
      }
    })

    if (!board) {
      return NextResponse.json({
        ok: false,
        error: '존재하지 않는 게시판입니다.'
      }, { status: 404 })
    }

    // 검색 조건
    const where: any = {
      type: board.type
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } }
      ]
    }

    // 게시글 목록 조회
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              username: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.post.count({ where })
    ])

    return NextResponse.json({
      ok: true,
      data: {
        board,
        posts,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error('게시판 조회 오류:', error)
    return NextResponse.json({
      ok: false,
      error: '게시판 조회 중 오류가 발생했습니다.'
    }, { status: 500 })
  }
}
