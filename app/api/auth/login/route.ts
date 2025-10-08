import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword, generateAccessToken, generateRefreshToken } from '@/lib/auth'
import { z } from 'zod'

export const runtime = 'nodejs'

const loginSchema = z.object({
  username: z.string().min(1, '사용자명을 입력해주세요'),
  password: z.string().min(1, '비밀번호를 입력해주세요'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = loginSchema.parse(body)

    // 사용자 조회
    const user = await prisma.member.findUnique({
      where: { username },
    })

    if (!user) {
      return NextResponse.json({
        ok: false,
        error: '사용자명 또는 비밀번호가 올바르지 않습니다.',
      }, { status: 401 })
    }

    // 비밀번호 확인
    const isValidPassword = await verifyPassword(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json({
        ok: false,
        error: '사용자명 또는 비밀번호가 올바르지 않습니다.',
      }, { status: 401 })
    }

    // 토큰 생성
    const tokenPayload = {
      id: user.id,
      username: user.username,
      role: user.role || 'USER',
    }

    const accessToken = generateAccessToken(tokenPayload)
    const refreshToken = generateRefreshToken(tokenPayload)

    // 리프레시 토큰 저장
    await prisma.refreshToken.create({
      data: {
        memberId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7일
      },
    })

    // 응답 데이터에서 비밀번호 제외
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      ok: true,
      data: {
        user: userWithoutPassword,
        accessToken,
        refreshToken,
      },
    })

  } catch (error) {
    console.error('Login error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        ok: false,
        error: error.errors[0].message,
      }, { status: 400 })
    }

    return NextResponse.json({
      ok: false,
      error: '로그인 중 오류가 발생했습니다.',
    }, { status: 500 })
  }
}
