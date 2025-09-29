import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({
        ok: false,
        error: '토큰이 필요합니다.',
      }, { status: 400 })
    }

    // 토큰 검증
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: {
        token,
      },
      include: {
        member: {
          select: {
            id: true,
            username: true,
            name: true,
            email: true,
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

    return NextResponse.json({
      ok: true,
      data: {
        member: resetToken.member,
      },
    })
  } catch (error) {
    console.error('토큰 검증 오류:', error)
    return NextResponse.json({
      ok: false,
      error: '토큰 검증 중 오류가 발생했습니다.',
    }, { status: 500 })
  }
}
