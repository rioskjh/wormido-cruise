import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

// POST: 게시글 작성
export async function POST(
  request: NextRequest,
  { params }: { params: { boardId: string } }
) {
  try {
    // 게시판 정보 조회
    const board = await prisma.board.findUnique({
      where: { boardId: params.boardId },
      select: { type: true, isAdminOnly: true }
    })

    if (!board) {
      return NextResponse.json({
        ok: false,
        error: '존재하지 않는 게시판입니다.'
      }, { status: 404 })
    }

    // 요청 데이터 검증
    const body = await request.json()
    
    // Q&A 게시판인 경우 비회원 작성 허용
    const isQnaBoard = board.type === 'QNA'
    const isGuestPost = isQnaBoard && body.isGuest === true
    
    let authorId = null
    let authorName = null
    let qnaPasswordHash = null
    
    if (isGuestPost) {
      // 비회원 작성인 경우
      if (!body.authorName || !body.password) {
        return NextResponse.json({
          ok: false,
          error: '비회원 작성 시 작성자명과 비밀번호가 필요합니다.'
        }, { status: 400 })
      }
      authorName = body.authorName
      qnaPasswordHash = await bcrypt.hash(body.password, 10)
    } else {
      // 회원 작성인 경우 - 인증 확인
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
      
      authorId = payload.id
    }

    // 요청 데이터 검증
    const schema = z.object({
      title: z.string().min(1, '제목을 입력해주세요.').max(200, '제목은 200자 이하로 입력해주세요.'),
      content: z.string().min(1, '내용을 입력해주세요.'),
      contentHtml: z.string().optional(),
      isGuest: z.boolean().optional(),
      authorName: z.string().optional(),
      password: z.string().optional(),
      isSecret: z.boolean().optional()
    })

    const validatedData = schema.parse(body)

    // 게시글 생성
    const post = await prisma.post.create({
      data: {
        title: validatedData.title,
        content: validatedData.content,
        contentHtml: validatedData.contentHtml || validatedData.content, // CKEditor HTML 내용
        type: board.type,
        authorId: authorId,
        authorName: authorName,
        qnaPasswordHash: qnaPasswordHash,
        isSecret: validatedData.isSecret || false,
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
