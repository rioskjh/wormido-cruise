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

    // 관리자 조회
    const admin = await prisma.admin.findUnique({
      where: { username },
    })

    if (!admin) {
      return NextResponse.json({
        ok: false,
        error: '사용자명 또는 비밀번호가 올바르지 않습니다.',
      }, { status: 401 })
    }

    // 관리자 활성화 상태 확인
    if (!admin.isActive) {
      return NextResponse.json({
        ok: false,
        error: '비활성화된 관리자 계정입니다.',
      }, { status: 401 })
    }

    // 비밀번호 확인
    const isValidPassword = await verifyPassword(password, admin.password)
    if (!isValidPassword) {
      return NextResponse.json({
        ok: false,
        error: '사용자명 또는 비밀번호가 올바르지 않습니다.',
      }, { status: 401 })
    }

    // 토큰 생성
    const tokenPayload = {
      id: admin.id,
      username: admin.username,
      role: admin.role,
    }

    const accessToken = generateAccessToken(tokenPayload)
    const refreshToken = generateRefreshToken(tokenPayload)

    // 마지막 로그인 시간 업데이트
    await prisma.admin.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    })

    // 응답 데이터에서 비밀번호 제외
    const { password: _, ...adminWithoutPassword } = admin

    // 응답 생성
    const response = NextResponse.json({
      ok: true,
      data: {
        admin: adminWithoutPassword,
        accessToken,
        refreshToken,
      },
    })

    // 쿠키에 토큰 저장 (미들웨어에서 사용)
    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60, // 15분
    })

    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7일
    })

    return response

  } catch (error) {
    console.error('Admin login error:', error)
    
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
