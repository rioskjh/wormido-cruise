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

    // 게시판 정보 (하드코딩된 정보 사용)
    const boardInfo = {
      'notice': { id: 1, boardId: 'notice', title: '공지사항', description: '월미도 크루즈의 주요 공지사항을 확인하세요.', type: 'NOTICE', isAdminOnly: false },
      'event': { id: 2, boardId: 'event', title: '이벤트', description: '다양한 이벤트와 혜택을 만나보세요.', type: 'EVENT', isAdminOnly: false },
      'review': { id: 3, boardId: 'review', title: '리뷰', description: '고객님들의 생생한 후기를 확인하세요.', type: 'REVIEW', isAdminOnly: false },
      'faq': { id: 4, boardId: 'faq', title: 'FAQ', description: '자주 묻는 질문과 답변을 확인하세요.', type: 'FAQ', isAdminOnly: true },
      'qna': { id: 5, boardId: 'qna', title: 'Q&A', description: '궁금한 점을 질문하고 답변을 받아보세요.', type: 'QNA', isAdminOnly: false }
    }

    const board = boardInfo[params.boardId as keyof typeof boardInfo]

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
