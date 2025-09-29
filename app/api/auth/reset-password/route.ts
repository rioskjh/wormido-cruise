import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

const resetPasswordSchema = z.object({
  token: z.string().min(1, '토큰이 필요합니다.'),
  password: z.string().min(6, '비밀번호는 최소 6자 이상이어야 합니다.'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = resetPasswordSchema.parse(body)

    // 토큰 검증
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: {
        token: validatedData.token,
      },
      include: {
        member: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    })

    if (!resetToken) {
      return NextResponse.json({
        ok: false,
        error: '유효하지 않은 토큰입니다.',
      }, { status: 404 })
    }

    // 토큰 만료 확인
    if (resetToken.expiresAt < new Date()) {
      // 만료된 토큰 삭제
      await prisma.passwordResetToken.delete({
        where: {
          id: resetToken.id,
        },
      })

      return NextResponse.json({
        ok: false,
        error: '만료된 토큰입니다.',
      }, { status: 410 })
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(validatedData.password, 10)

    // 트랜잭션으로 비밀번호 업데이트 및 토큰 삭제
    await prisma.$transaction(async (tx) => {
      // 비밀번호 업데이트
      await tx.member.update({
        where: {
          id: resetToken.memberId,
        },
        data: {
          password: hashedPassword,
        },
      })

      // 사용된 토큰 삭제
      await tx.passwordResetToken.delete({
        where: {
          id: resetToken.id,
        },
      })

      // 해당 회원의 모든 리프레시 토큰 삭제 (보안상)
      await tx.refreshToken.deleteMany({
        where: {
          memberId: resetToken.memberId,
        },
      })
    })

    return NextResponse.json({
      ok: true,
      data: {
        message: '비밀번호가 성공적으로 변경되었습니다.',
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        ok: false,
        error: error.errors[0].message,
      }, { status: 400 })
    }

    console.error('비밀번호 재설정 오류:', error)
    return NextResponse.json({
      ok: false,
      error: '비밀번호 재설정 중 오류가 발생했습니다.',
    }, { status: 500 })
  }
}
