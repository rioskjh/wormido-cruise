import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { z } from 'zod'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const createScheduleSchema = z.object({
  option1ValueId: z.number().int().optional().nullable(),
  option2ValueId: z.number().int().optional().nullable(),
  option3ValueId: z.number().int().optional().nullable(),
  maxCapacity: z.number().int().min(1, '수용인원은 1 이상이어야 합니다.'),
  isActive: z.boolean().default(true),
})

const updateScheduleSchema = z.object({
  option1ValueId: z.number().int().optional().nullable(),
  option2ValueId: z.number().int().optional().nullable(),
  option3ValueId: z.number().int().optional().nullable(),
  maxCapacity: z.number().int().min(1, '수용인원은 1 이상이어야 합니다.').optional(),
  isActive: z.boolean().optional(),
})

// 상품 스케줄 목록 조회
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

    const productId = parseInt(params.id)
    if (isNaN(productId)) {
      return NextResponse.json({
        ok: false,
        error: '유효하지 않은 상품 ID입니다.',
      }, { status: 400 })
    }

    // 상품 존재 확인
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true, useOptions: true }
    })

    if (!product) {
      return NextResponse.json({
        ok: false,
        error: '상품을 찾을 수 없습니다.',
      }, { status: 404 })
    }

    // 상품 스케줄 목록 조회
    const schedules = await prisma.productSchedule.findMany({
      where: { productId },
      include: {
        option1Value: true,
        option2Value: true,
        option3Value: true,
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      ok: true,
      data: schedules
    })

  } catch (error) {
    console.error('Product schedules fetch error:', error)
    return NextResponse.json({
      ok: false,
      error: '상품 스케줄 목록을 불러오는 중 오류가 발생했습니다.',
    }, { status: 500 })
  }
}

// 상품 스케줄 생성
export async function POST(
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

    const productId = parseInt(params.id)
    if (isNaN(productId)) {
      return NextResponse.json({
        ok: false,
        error: '유효하지 않은 상품 ID입니다.',
      }, { status: 400 })
    }

    const body = await request.json()
    const validatedData = createScheduleSchema.parse(body)

    // 상품 존재 및 옵션 사용 여부 확인
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true, useOptions: true }
    })

    if (!product) {
      return NextResponse.json({
        ok: false,
        error: '상품을 찾을 수 없습니다.',
      }, { status: 404 })
    }

    if (!product.useOptions) {
      return NextResponse.json({
        ok: false,
        error: '이 상품은 옵션을 사용하지 않습니다.',
      }, { status: 400 })
    }

    // 중복 스케줄 확인
    const existingSchedule = await prisma.productSchedule.findFirst({
      where: {
        productId,
        option1ValueId: validatedData.option1ValueId,
        option2ValueId: validatedData.option2ValueId,
        option3ValueId: validatedData.option3ValueId,
      }
    })

    if (existingSchedule) {
      return NextResponse.json({
        ok: false,
        error: '이미 동일한 옵션 조합의 스케줄이 존재합니다.',
      }, { status: 400 })
    }

    // 스케줄 생성
    const schedule = await prisma.productSchedule.create({
      data: {
        ...validatedData,
        productId
      },
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
    console.error('Product schedule create error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        ok: false,
        error: error.errors[0].message,
      }, { status: 400 })
    }

    return NextResponse.json({
      ok: false,
      error: '상품 스케줄 생성 중 오류가 발생했습니다.',
    }, { status: 500 })
  }
}
