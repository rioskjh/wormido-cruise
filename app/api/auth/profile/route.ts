import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const updateProfileSchema = z.object({
  email: z.string().email('올바른 이메일 형식이 아닙니다').optional(),
  phone: z.string()
    .min(10, '연락처는 최소 10자리여야 합니다')
    .max(11, '연락처는 최대 11자리까지 가능합니다')
    .regex(/^[0-9]+$/, '연락처는 숫자만 입력해주세요')
    .optional(),
  nickname: z.string().min(1, '닉네임을 입력해주세요').optional(),
  password: z.string()
    .min(6, '비밀번호는 최소 6자 이상이어야 합니다')
    .max(30, '비밀번호는 최대 30자까지 가능합니다')
    .regex(/^(?=.*[a-zA-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).*$/, '비밀번호는 영문과 특수문자를 각각 최소 1자 이상 포함해야 합니다')
    .optional(),
})

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        ok: false,
        error: '인증 토큰이 필요합니다.',
      }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const payload = verifyToken(token)

    if (!payload) {
      return NextResponse.json({
        ok: false,
        error: '유효하지 않은 토큰입니다.',
      }, { status: 401 })
    }

    const user = await prisma.member.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        username: true,
        email: true,
        nickname: true,
        phone: true,
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
    console.error('Get profile error:', error)
    
    return NextResponse.json({
      ok: false,
      error: '프로필 조회 중 오류가 발생했습니다.',
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        ok: false,
        error: '인증 토큰이 필요합니다.',
      }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const payload = verifyToken(token)

    if (!payload) {
      return NextResponse.json({
        ok: false,
        error: '유효하지 않은 토큰입니다.',
      }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateProfileSchema.parse(body)

    // 현재 사용자 정보 조회
    const currentUser = await prisma.member.findUnique({
      where: { id: payload.id },
    })

    if (!currentUser) {
      return NextResponse.json({
        ok: false,
        error: '사용자를 찾을 수 없습니다.',
      }, { status: 404 })
    }

    // 이메일 중복 검증 (변경하는 경우에만)
    if (validatedData.email && validatedData.email !== currentUser.email) {
      const existingEmail = await prisma.member.findFirst({
        where: {
          email: validatedData.email,
          id: { not: payload.id }
        }
      })

      if (existingEmail) {
        return NextResponse.json({
          ok: false,
          error: '이미 사용 중인 이메일입니다.',
        }, { status: 400 })
      }
    }

    // 연락처 중복 검증 (변경하는 경우에만)
    if (validatedData.phone && validatedData.phone !== currentUser.phone) {
      const existingPhone = await prisma.member.findFirst({
        where: {
          phone: validatedData.phone,
          id: { not: payload.id }
        }
      })

      if (existingPhone) {
        return NextResponse.json({
          ok: false,
          error: '이미 사용 중인 연락처입니다.',
        }, { status: 400 })
      }
    }

    // 업데이트할 데이터 준비
    const updateData: any = {}
    
    if (validatedData.email) updateData.email = validatedData.email
    if (validatedData.phone) updateData.phone = validatedData.phone
    if (validatedData.nickname) updateData.nickname = validatedData.nickname
    if (validatedData.password) {
      const { hashPassword } = await import('@/lib/auth')
      updateData.password = await hashPassword(validatedData.password)
    }

    // 사용자 정보 업데이트
    const updatedUser = await prisma.member.update({
      where: { id: payload.id },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        nickname: true,
        phone: true,
        role: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({
      ok: true,
      data: { user: updatedUser },
    })

  } catch (error) {
    console.error('Update profile error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        ok: false,
        error: error.errors[0].message,
      }, { status: 400 })
    }

    return NextResponse.json({
      ok: false,
      error: '프로필 업데이트 중 오류가 발생했습니다.',
    }, { status: 500 })
  }
}
