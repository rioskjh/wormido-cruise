import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { z } from 'zod'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const updateScheduleSchema = z.object({
  option1ValueId: z.number().int().optional().nullable(),
  option2ValueId: z.number().int().optional().nullable(),
  option3ValueId: z.number().int().optional().nullable(),
  maxCapacity: z.number().int().min(1, '수용인원은 1 이상이어야 합니다.').optional(),
  isActive: z.boolean().optional(),
})

// 개별 스케줄 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; scheduleId: string } }
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

    const productId = parseInt(params.id)
    const scheduleId = parseInt(params.scheduleId)
    
    if (isNaN(productId) || isNaN(scheduleId)) {
      return NextResponse.json({
        ok: false,
        error: '유효하지 않은 ID입니다.',
      }, { status: 400 })
    }

    const schedule = await prisma.productSchedule.findFirst({
      where: { 
        id: scheduleId,
        productId: productId
      },
      include: {
        option1Value: true,
        option2Value: true,
        option3Value: true,
      }
    })

    if (!schedule) {
      return NextResponse.json({
        ok: false,
        error: '스케줄을 찾을 수 없습니다.',
      }, { status: 404 })
    }

    return NextResponse.json({
      ok: true,
      data: schedule
    })

  } catch (error) {
    console.error('Product schedule fetch error:', error)
    return NextResponse.json({
      ok: false,
      error: '스케줄 정보를 불러오는 중 오류가 발생했습니다.',
    }, { status: 500 })
  }
}

// 개별 스케줄 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; scheduleId: string } }
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

    const productId = parseInt(params.id)
    const scheduleId = parseInt(params.scheduleId)
    
    if (isNaN(productId) || isNaN(scheduleId)) {
      return NextResponse.json({
        ok: false,
        error: '유효하지 않은 ID입니다.',
      }, { status: 400 })
    }

    const body = await request.json()
    const validatedData = updateScheduleSchema.parse(body)

    // 스케줄 존재 확인
    const existingSchedule = await prisma.productSchedule.findFirst({
      where: { 
        id: scheduleId,
        productId: productId
      }
    })

    if (!existingSchedule) {
      return NextResponse.json({
        ok: false,
        error: '스케줄을 찾을 수 없습니다.',
      }, { status: 404 })
    }

    // 중복 스케줄 확인 (자기 자신 제외)
    if (validatedData.option1ValueId !== undefined || 
        validatedData.option2ValueId !== undefined || 
        validatedData.option3ValueId !== undefined) {
      
      const duplicateSchedule = await prisma.productSchedule.findFirst({
        where: {
          productId,
          id: { not: scheduleId },
          option1ValueId: validatedData.option1ValueId ?? existingSchedule.option1ValueId,
          option2ValueId: validatedData.option2ValueId ?? existingSchedule.option2ValueId,
          option3ValueId: validatedData.option3ValueId ?? existingSchedule.option3ValueId,
        }
      })

      if (duplicateSchedule) {
        return NextResponse.json({
          ok: false,
          error: '이미 동일한 옵션 조합의 스케줄이 존재합니다.',
        }, { status: 400 })
      }
    }

    // 스케줄 수정
    const schedule = await prisma.productSchedule.update({
      where: { id: scheduleId },
      data: validatedData,
      include: {
        option1Value: true,
        option2Value: true,
        option3Value: true,
      }
    })

    return NextResponse.json({
      ok: true,
      data: schedule
    })

  } catch (error) {
    console.error('Product schedule update error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        ok: false,
        error: error.errors[0].message,
      }, { status: 400 })
    }

    return NextResponse.json({
      ok: false,
      error: '스케줄 수정 중 오류가 발생했습니다.',
    }, { status: 500 })
  }
}

// 개별 스케줄 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; scheduleId: string } }
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

    const productId = parseInt(params.id)
    const scheduleId = parseInt(params.scheduleId)
    
    if (isNaN(productId) || isNaN(scheduleId)) {
      return NextResponse.json({
        ok: false,
        error: '유효하지 않은 ID입니다.',
      }, { status: 400 })
    }

    // 스케줄 존재 확인
    const existingSchedule = await prisma.productSchedule.findFirst({
      where: { 
        id: scheduleId,
        productId: productId
      }
    })

    if (!existingSchedule) {
      return NextResponse.json({
        ok: false,
        error: '스케줄을 찾을 수 없습니다.',
      }, { status: 404 })
    }

    // 예약이 있는 스케줄은 삭제 불가
    if (existingSchedule.currentBookings > 0) {
      return NextResponse.json({
        ok: false,
        error: '예약이 있는 스케줄은 삭제할 수 없습니다.',
      }, { status: 400 })
    }

    // 스케줄 삭제
    await prisma.productSchedule.delete({
      where: { id: scheduleId }
    })

    return NextResponse.json({
      ok: true,
      message: '스케줄이 성공적으로 삭제되었습니다.',
    })

  } catch (error) {
    console.error('Product schedule delete error:', error)
    return NextResponse.json({
      ok: false,
      error: '스케줄 삭제 중 오류가 발생했습니다.',
    }, { status: 500 })
  }
}
