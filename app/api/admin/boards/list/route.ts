import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// 게시판 목록 조회 (네비게이션용)
export async function GET(request: NextRequest) {
  try {
    // 관리자 인증 확인
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        ok: false,
        error: '인증 토큰이 필요합니다.',
      }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const payload = verifyToken(token)
    
    if (!payload || (payload.role !== 'ADMIN' && payload.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({
        ok: false,
        error: '관리자 권한이 필요합니다.',
      }, { status: 403 })
    }

    // 게시판 목록 조회 (Post 모델의 type 기반)
    const boardTypes = [
      { id: 1, title: '공지사항', boardId: 'notice' },
      { id: 2, title: '이벤트', boardId: 'event' },
      { id: 3, title: '리뷰', boardId: 'review' },
      { id: 4, title: 'FAQ', boardId: 'faq' },
      { id: 5, title: 'Q&A', boardId: 'qna' }
    ]

    return NextResponse.json({
      ok: true,
      data: boardTypes
    })
  } catch (error) {
    console.error('게시판 조회 오류:', error)
    return NextResponse.json({
      ok: false,
      error: '게시판 조회 중 오류가 발생했습니다.'
    }, { status: 500 })
  }
}
