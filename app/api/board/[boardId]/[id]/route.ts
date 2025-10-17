import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { getNoCacheHeaders } from '@/lib/cache-headers'

// 동적 렌더링 강제
export const dynamic = 'force-dynamic'

// GET: 게시글 상세 조회
export async function GET(
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

    // 게시판 정보 조회
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

    // 게시글 조회
    const post = await prisma.post.findFirst({
      where: {
        id: postId,
        type: boardType
      },
      include: {
        members: {
          select: {
            id: true,
            username: true
          }
        }
      }
    })

    if (!post) {
      return NextResponse.json({
        ok: false,
        error: '게시글을 찾을 수 없습니다.'
      }, { status: 404 })
    }

    // 조회수 증가
    await prisma.post.update({
      where: { id: postId },
      data: { views: { increment: 1 } }
    })

    return NextResponse.json({
      ok: true,
      data: {
        post,
        board
      },
      timestamp: new Date().toISOString()
    }, {
      headers: getNoCacheHeaders()
    })
  } catch (error) {
    console.error('게시글 조회 오류:', error)
    return NextResponse.json({
      ok: false,
      error: '게시글 조회 중 오류가 발생했습니다.'
    }, { status: 500 })
  }
}

// DELETE: 게시글 삭제
export async function DELETE(
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

    // 게시글 조회
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        authorId: true,
        authorName: true,
        qnaPasswordHash: true
      }
    })

    if (!post) {
      return NextResponse.json({
        ok: false,
        error: '게시글을 찾을 수 없습니다.'
      }, { status: 404 })
    }

    // 권한 확인
    const authHeader = request.headers.get('authorization')
    let isAuthorized = false

    if (authHeader && authHeader.startsWith('Bearer ')) {
      // 회원 작성자인 경우 토큰 검증
      const token = authHeader.substring(7)
      const payload = verifyToken(token)
      
      if (payload && post.authorId && payload.id === post.authorId) {
        isAuthorized = true
      }
    }

    // 비회원 작성자인 경우 비밀번호 검증 (이미 프론트엔드에서 검증됨)
    if (!isAuthorized && post.authorName && !post.authorId) {
      // 비회원 게시글은 프론트엔드에서 비밀번호 검증 후 요청
      isAuthorized = true
    }

    if (!isAuthorized) {
      return NextResponse.json({
        ok: false,
        error: '게시글을 삭제할 권한이 없습니다.'
      }, { status: 403 })
    }

    // 게시글 삭제
    await prisma.post.delete({
      where: { id: postId }
    })

    return NextResponse.json({
      ok: true,
      message: '게시글이 삭제되었습니다.'
    })

  } catch (error) {
    console.error('게시글 삭제 오류:', error)
    return NextResponse.json({
      ok: false,
      error: '게시글 삭제 중 오류가 발생했습니다.'
    }, { status: 500 })
  }
}
