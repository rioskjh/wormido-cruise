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

    // 실제 게시판 목록 조회
    const boards = await prisma.board.findMany({
      select: {
        id: true,
        boardId: true,
        title: true,
        type: true,
        isAdminOnly: true
      },
      orderBy: {
        id: 'asc'
      }
    })

    return NextResponse.json({
      ok: true,
      data: boards
    })
  } catch (error) {
    console.error('게시판 조회 오류:', error)
    return NextResponse.json({
      ok: false,
      error: '게시판 조회 중 오류가 발생했습니다.'
    }, { status: 500 })
  }
}
