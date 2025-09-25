import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { z } from 'zod'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const updateMemberSchema = z.object({
  username: z.string().min(1, '사용자명은 필수입니다.').optional(),
  email: z.string().email('유효한 이메일을 입력해주세요.').optional(),
  nickname: z.string().min(1, '닉네임은 필수입니다.').optional(),
  role: z.enum(['USER', 'EDITOR', 'ADMIN']).optional(),
  isActive: z.boolean().optional(),
})

// 개별 회원 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
    if (!payload || (payload.role !== 'ADMIN' && payload.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({
        ok: false,
        error: '관리자 권한이 필요합니다.',
      }, { status: 403 })
    }

    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({
        ok: false,
        error: '유효하지 않은 회원 ID입니다.',
      }, { status: 400 })
    }

    const member = await prisma.member.findUnique({
      where: { id },
      include: {
        reservations: {
          include: {
            product: {
              select: {
                name: true,
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        orders: {
          include: {
            items: {
              include: {
                product: {
                  select: {
                    name: true,
                  }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            reservations: true,
            orders: true,
          }
        }
      },
    })

    if (!member) {
      return NextResponse.json({
        ok: false,
        error: '회원을 찾을 수 없습니다.',
      }, { status: 404 })
    }

    return NextResponse.json({
      ok: true,
      data: member,
    })

  } catch (error) {
    console.error('Admin member fetch error:', error)
    return NextResponse.json({
      ok: false,
      error: '회원 정보를 불러오는 중 오류가 발생했습니다.',
    }, { status: 500 })
  }
}

// 회원 정보 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
    if (!payload || (payload.role !== 'ADMIN' && payload.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({
        ok: false,
        error: '관리자 권한이 필요합니다.',
      }, { status: 403 })
    }

    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({
        ok: false,
        error: '유효하지 않은 회원 ID입니다.',
      }, { status: 400 })
    }

    const body = await request.json()
    const validatedData = updateMemberSchema.parse(body)

    // 회원 존재 확인
    const existingMember = await prisma.member.findUnique({
      where: { id },
    })

    if (!existingMember) {
      return NextResponse.json({
        ok: false,
        error: '회원을 찾을 수 없습니다.',
      }, { status: 404 })
    }

    // 이메일 중복 검사 (다른 회원이 사용 중인지 확인)
    if (validatedData.email && validatedData.email !== existingMember.email) {
      const emailExists = await prisma.member.findFirst({
        where: {
          email: validatedData.email,
          id: { not: id }
        }
      })

      if (emailExists) {
        return NextResponse.json({
          ok: false,
          error: '이미 사용 중인 이메일입니다.',
        }, { status: 400 })
      }
    }

    // 사용자명 중복 검사 (다른 회원이 사용 중인지 확인)
    if (validatedData.username && validatedData.username !== existingMember.username) {
      const usernameExists = await prisma.member.findFirst({
        where: {
          username: validatedData.username,
          id: { not: id }
        }
      })

      if (usernameExists) {
        return NextResponse.json({
          ok: false,
          error: '이미 사용 중인 사용자명입니다.',
        }, { status: 400 })
      }
    }

    // 회원 정보 수정
    const member = await prisma.member.update({
      where: { id },
      data: validatedData,
    })

    return NextResponse.json({
      ok: true,
      data: member,
    })

  } catch (error) {
    console.error('Admin member update error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        ok: false,
        error: error.errors[0].message,
      }, { status: 400 })
    }

    return NextResponse.json({
      ok: false,
      error: '회원 정보 수정 중 오류가 발생했습니다.',
    }, { status: 500 })
  }
}

// 회원 삭제 (비활성화)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
    if (!payload || (payload.role !== 'ADMIN' && payload.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({
        ok: false,
        error: '관리자 권한이 필요합니다.',
      }, { status: 403 })
    }

    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({
        ok: false,
        error: '유효하지 않은 회원 ID입니다.',
      }, { status: 400 })
    }

    // 회원 존재 확인
    const existingMember = await prisma.member.findUnique({
      where: { id },
      include: {
        reservations: { select: { id: true } },
        orders: { select: { id: true } },
      }
    })

    if (!existingMember) {
      return NextResponse.json({
        ok: false,
        error: '회원을 찾을 수 없습니다.',
      }, { status: 404 })
    }

    // 예약이나 주문이 있는 회원은 삭제 불가 (비활성화만 가능)
    if (existingMember.reservations.length > 0 || existingMember.orders.length > 0) {
      return NextResponse.json({
        ok: false,
        error: '예약 또는 주문이 있는 회원은 삭제할 수 없습니다. 비활성화를 사용해주세요.',
      }, { status: 400 })
    }

    // 회원 삭제
    await prisma.member.delete({
      where: { id },
    })

    return NextResponse.json({
      ok: true,
      message: '회원이 성공적으로 삭제되었습니다.',
    })

  } catch (error) {
    console.error('Admin member delete error:', error)
    return NextResponse.json({
      ok: false,
      error: '회원 삭제 중 오류가 발생했습니다.',
    }, { status: 500 })
  }
}
