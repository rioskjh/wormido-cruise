import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

const findPasswordSchema = z.object({
  username: z.string().min(1, '아이디를 입력해주세요.'),
  name: z.string().min(1, '이름을 입력해주세요.'),
  email: z.string().email('올바른 이메일을 입력해주세요.'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = findPasswordSchema.parse(body)

    // 아이디, 이름, 이메일로 회원 찾기
    const member = await prisma.member.findFirst({
      where: {
        username: validatedData.username,
        name: validatedData.name,
        email: validatedData.email,
      },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
      },
    })

    if (!member) {
      return NextResponse.json({
        ok: false,
        error: '입력하신 정보와 일치하는 회원을 찾을 수 없습니다.',
      }, { status: 404 })
    }

    // 비밀번호 재설정 토큰 생성 (24시간 유효)
    const resetToken = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24시간 후

    // 기존 토큰이 있다면 삭제
    await prisma.passwordResetToken.deleteMany({
      where: {
        memberId: member.id,
      },
    })

    // 새 토큰 저장
    await prisma.passwordResetToken.create({
      data: {
        token: resetToken,
        memberId: member.id,
        expiresAt,
      },
    })

    // 이메일 전송 (실제 구현에서는 nodemailer 등을 사용)
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`
    
    // TODO: 실제 이메일 전송 로직 구현
    console.log(`비밀번호 재설정 링크: ${resetUrl}`)
    console.log(`회원: ${member.name} (${member.email})`)

    // 개발 환경에서는 콘솔에 링크 출력
    if (process.env.NODE_ENV === 'development') {
      console.log('=== 비밀번호 재설정 링크 ===')
      console.log(resetUrl)
      console.log('========================')
    }

    return NextResponse.json({
      ok: true,
      data: {
        message: '비밀번호 재설정 링크가 이메일로 전송되었습니다.',
        // 개발 환경에서만 토큰 반환
        ...(process.env.NODE_ENV === 'development' && { resetToken }),
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        ok: false,
        error: error.errors[0].message,
      }, { status: 400 })
    }

    console.error('비밀번호 찾기 오류:', error)
    return NextResponse.json({
      ok: false,
      error: '비밀번호 찾기 중 오류가 발생했습니다.',
    }, { status: 500 })
  }
}
