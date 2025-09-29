import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// 동적 렌더링 강제
export const dynamic = 'force-dynamic'

// POST: 비밀번호 검증
export async function POST(
  request: NextRequest,
  { params }: { params: { boardId: string; id: string } }
) {
  try {
    const postId = parseInt(params.id)
    if (isNaN(postId)) {
      return NextResponse.json({
        ok: false,
        error: '잘못된 게시글 ID입니다.'
      }, { status: 400 })
    }

    const body = await request.json()
    const { password } = body

    if (!password) {
      return NextResponse.json({
        ok: false,
        error: '비밀번호를 입력해주세요.'
      }, { status: 400 })
    }

    // 게시글 조회
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        qnaPasswordHash: true,
        authorId: true,
        authorName: true
      }
    })

    if (!post) {
      return NextResponse.json({
        ok: false,
        error: '게시글을 찾을 수 없습니다.'
      }, { status: 404 })
    }

    // 비회원 게시글이 아니면 검증 실패
    if (post.authorId || !post.qnaPasswordHash) {
      return NextResponse.json({
        ok: false,
        error: '비밀번호 검증이 필요하지 않은 게시글입니다.'
      }, { status: 400 })
    }

    // 비밀번호 검증
    const isValid = await bcrypt.compare(password, post.qnaPasswordHash)

    return NextResponse.json({
      ok: isValid,
      error: isValid ? null : '비밀번호가 올바르지 않습니다.'
    })

  } catch (error) {
    console.error('비밀번호 검증 오류:', error)
    return NextResponse.json({
      ok: false,
      error: '비밀번호 검증 중 오류가 발생했습니다.'
    }, { status: 500 })
  }
}
