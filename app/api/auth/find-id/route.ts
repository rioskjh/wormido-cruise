import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const findIdSchema = z.object({
  name: z.string().min(1, '이름을 입력해주세요.'),
  email: z.string().email('올바른 이메일을 입력해주세요.'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = findIdSchema.parse(body)

    // 이름과 이메일로 회원 찾기
    const member = await prisma.member.findFirst({
      where: {
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

    return NextResponse.json({
      ok: true,
      data: {
        username: member.username,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        ok: false,
        error: error.errors[0].message,
      }, { status: 400 })
    }

    console.error('아이디 찾기 오류:', error)
    return NextResponse.json({
      ok: false,
      error: '아이디 찾기 중 오류가 발생했습니다.',
    }, { status: 500 })
  }
}
