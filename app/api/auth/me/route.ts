import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        ok: false,
        error: '인증 토큰이 필요합니다.',
      }, { status: 401 })
    }

    const token = authHeader.substring(7) // 'Bearer ' 제거
    const payload = verifyToken(token)

    if (!payload) {
      return NextResponse.json({
        ok: false,
        error: '유효하지 않은 토큰입니다.',
      }, { status: 401 })
    }

    // 사용자 정보 조회
    const user = await prisma.member.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        username: true,
        email: true,
        nickname: true,
        role: true,
        createdAt: true,
      },
    })

    if (!user) {
      return NextResponse.json({
        ok: false,
        error: '사용자를 찾을 수 없습니다.',
      }, { status: 404 })
    }

    return NextResponse.json({
      ok: true,
      data: { user },
    })

  } catch (error) {
    console.error('Auth me error:', error)
    
    return NextResponse.json({
      ok: false,
      error: '인증 확인 중 오류가 발생했습니다.',
    }, { status: 500 })
  }
}
