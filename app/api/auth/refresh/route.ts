import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyRefreshToken, generateAccessToken } from '@/lib/auth'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { refreshToken } = body

    if (!refreshToken) {
      return NextResponse.json({
        ok: false,
        error: '리프레시 토큰이 필요합니다.',
      }, { status: 400 })
    }

    // 리프레시 토큰 검증
    const payload = verifyRefreshToken(refreshToken)
    if (!payload) {
      return NextResponse.json({
        ok: false,
        error: '유효하지 않은 리프레시 토큰입니다.',
      }, { status: 401 })
    }

    // 데이터베이스에서 리프레시 토큰 확인
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { member: true },
    })

    if (!storedToken || storedToken.expiresAt < new Date()) {
      return NextResponse.json({
        ok: false,
        error: '만료된 리프레시 토큰입니다.',
      }, { status: 401 })
    }

    // 새로운 액세스 토큰 생성
    const tokenPayload = {
      id: storedToken.member.id,
      username: storedToken.member.username,
      role: storedToken.member.role || 'USER',
    }

    const newAccessToken = generateAccessToken(tokenPayload)

    return NextResponse.json({
      ok: true,
      data: {
        accessToken: newAccessToken,
      },
    })

  } catch (error) {
    console.error('Refresh token error:', error)
    return NextResponse.json({
      ok: false,
      error: '토큰 갱신 중 오류가 발생했습니다.',
    }, { status: 500 })
  }
}
