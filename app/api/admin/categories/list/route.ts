import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// 동적 렌더링 강제
export const dynamic = 'force-dynamic'

// 카테고리 목록 조회 (네비게이션용)
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

    // 활성화된 카테고리 목록 조회
    const categories = await prisma.category.findMany({
      where: {
        isActive: true
      },
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'asc' }
      ],
      select: {
        id: true,
        name: true,
        sortOrder: true
      }
    })

    return NextResponse.json({
      ok: true,
      data: categories
    })
  } catch (error) {
    console.error('카테고리 조회 오류:', error)
    return NextResponse.json({
      ok: false,
      error: '카테고리 조회 중 오류가 발생했습니다.'
    }, { status: 500 })
  }
}
