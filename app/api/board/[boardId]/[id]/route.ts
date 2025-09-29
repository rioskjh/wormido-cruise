import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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

    // 게시글 조회
    const post = await prisma.post.findFirst({
      where: {
        id: postId,
        type: boardType
      },
      include: {
        author: {
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
