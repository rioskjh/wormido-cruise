import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { z } from 'zod'

// GET: 게시글 수정을 위한 데이터 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { boardId: string; id: string } }
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

    const postId = parseInt(params.id)
    if (isNaN(postId)) {
      return NextResponse.json({
        ok: false,
        error: '잘못된 게시글 ID입니다.'
      }, { status: 400 })
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

    // 게시글 조회
    const post = await prisma.post.findFirst({
      where: {
        id: postId,
        type: boardType
      }
    })

    if (!post) {
      return NextResponse.json({
        ok: false,
        error: '게시글을 찾을 수 없습니다.'
      }, { status: 404 })
    }

    // 작성자 확인
    if (post.authorId !== payload.id) {
      return NextResponse.json({
        ok: false,
        error: '게시글을 수정할 권한이 없습니다.'
      }, { status: 403 })
    }

    return NextResponse.json({
      ok: true,
      data: post
    })
  } catch (error) {
    console.error('게시글 조회 오류:', error)
    return NextResponse.json({
      ok: false,
      error: '게시글 조회 중 오류가 발생했습니다.'
    }, { status: 500 })
  }
}

// PUT: 게시글 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: { boardId: string; id: string } }
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

    const postId = parseInt(params.id)
    if (isNaN(postId)) {
      return NextResponse.json({
        ok: false,
        error: '잘못된 게시글 ID입니다.'
      }, { status: 400 })
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

    // 기존 게시글 조회 및 권한 확인
    const existingPost = await prisma.post.findFirst({
      where: {
        id: postId,
        type: boardType
      }
    })

    if (!existingPost) {
      return NextResponse.json({
        ok: false,
        error: '게시글을 찾을 수 없습니다.'
      }, { status: 404 })
    }

    if (existingPost.authorId !== payload.id) {
      return NextResponse.json({
        ok: false,
        error: '게시글을 수정할 권한이 없습니다.'
      }, { status: 403 })
    }

    // 게시글 수정
    const post = await prisma.post.update({
      where: { id: postId },
      data: {
        title: validatedData.title,
        content: validatedData.content
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

    console.error('게시글 수정 오류:', error)
    return NextResponse.json({
      ok: false,
      error: '게시글 수정 중 오류가 발생했습니다.'
    }, { status: 500 })
  }
}
