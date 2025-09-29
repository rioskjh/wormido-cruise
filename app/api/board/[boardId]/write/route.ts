import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { z } from 'zod'

// POST: 게시글 작성
export async function POST(
  request: NextRequest,
  { params }: { params: { boardId: string } }
) {
  try {
    // 인증 확인
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        ok: false,
        error: '로그인이 필요합니다.',
      }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const payload = verifyToken(token)
    
    if (!payload) {
      return NextResponse.json({
        ok: false,
        error: '유효하지 않은 토큰입니다.',
      }, { status: 401 })
    }

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

    // 요청 데이터 검증
    const body = await request.json()
    const schema = z.object({
      title: z.string().min(1, '제목을 입력해주세요.').max(200, '제목은 200자 이하로 입력해주세요.'),
      content: z.string().min(1, '내용을 입력해주세요.')
    })

    const validatedData = schema.parse(body)

    // 게시글 생성
    const post = await prisma.post.create({
      data: {
        title: validatedData.title,
        content: validatedData.content,
        type: boardType,
        authorId: payload.id,
        views: 0
      }
    })

    return NextResponse.json({
      ok: true,
      data: post
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        ok: false,
        error: error.errors[0].message
      }, { status: 400 })
    }

    console.error('게시글 작성 오류:', error)
    return NextResponse.json({
      ok: false,
      error: '게시글 작성 중 오류가 발생했습니다.'
    }, { status: 500 })
  }
}
