import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateAccessToken, generateRefreshToken } from '@/lib/auth'
import { z } from 'zod'

export const runtime = 'nodejs'

const registerSchema = z.object({
  username: z.string()
    .min(6, '사용자명은 최소 6자 이상이어야 합니다')
    .max(20, '사용자명은 최대 20자까지 가능합니다')
    .regex(/^[a-zA-Z0-9]+$/, '사용자명은 영문과 숫자만 사용할 수 있습니다'),
  email: z.string().email('올바른 이메일 형식이 아닙니다'),
  password: z.string()
    .min(6, '비밀번호는 최소 6자 이상이어야 합니다')
    .max(30, '비밀번호는 최대 30자까지 가능합니다')
    .regex(/^(?=.*[a-zA-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).*$/, '비밀번호는 영문과 특수문자를 각각 최소 1자 이상 포함해야 합니다'),
  nickname: z.string().min(1, '닉네임을 입력해주세요'),
  phone: z.string()
    .min(10, '연락처는 최소 10자리여야 합니다')
    .max(11, '연락처는 최대 11자리까지 가능합니다')
    .regex(/^[0-9]+$/, '연락처는 숫자만 입력해주세요'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, email, password, nickname, phone } = registerSchema.parse(body)

    // 중복 확인 - 모든 고유 필드 검사
    const existingUsers = await prisma.member.findMany({
      where: {
        OR: [
          { username },
          { email },
          { phone },
        ],
      },
      select: {
        username: true,
        email: true,
        phone: true,
      },
    })

    if (existingUsers.length > 0) {
      const duplicateFields = []
      
      // 중복된 필드들 확인
      const existingUser = existingUsers[0]
      if (existingUser.username === username) {
        duplicateFields.push('아이디')
      }
      if (existingUser.email === email) {
        duplicateFields.push('이메일')
      }
      if (existingUser.phone === phone) {
        duplicateFields.push('연락처')
      }

      return NextResponse.json({
        ok: false,
        error: `해당 항목을 이미 사용중입니다. [${duplicateFields.join(', ')}]`,
      }, { status: 400 })
    }

    // 비밀번호 해싱
    const hashedPassword = await hashPassword(password)

    // 사용자 생성
    const user = await prisma.member.create({
      data: {
        username,
        email,
        password: hashedPassword,
        nickname,
        phone,
        role: 'USER',
      },
    })

    // 토큰 생성
    const tokenPayload = {
      id: user.id,
      username: user.username,
      role: user.role,
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
    console.error('Register error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        ok: false,
        error: error.errors[0].message,
      }, { status: 400 })
    }

    return NextResponse.json({
      ok: false,
      error: '회원가입 중 오류가 발생했습니다.',
    }, { status: 500 })
  }
}
