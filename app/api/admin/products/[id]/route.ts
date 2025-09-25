import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { z } from 'zod'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const updateProductSchema = z.object({
  name: z.string().min(1, '상품명을 입력해주세요').optional(),
  description: z.string().optional(),
  detailHtml: z.string().optional(),
  categoryId: z.number().optional(),
  basePrice: z.number().min(0, '기본 가격은 0 이상이어야 합니다').optional(),
  adultPrice: z.number().min(0, '성인 가격은 0 이상이어야 합니다').optional(),
  childPrice: z.number().min(0, '아동 가격은 0 이상이어야 합니다').optional(),
  infantPrice: z.number().min(0, '유아 가격은 0 이상이어야 합니다').optional(),
  maxCapacity: z.number().min(1, '최대 수용 인원은 1명 이상이어야 합니다').optional(),
  isActive: z.boolean().optional(),
  useOptions: z.boolean().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

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

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
        personTypePrices: true,
        productOptions: {
          include: {
            values: true,
          },
        },
        _count: {
          select: {
            reservations: true,
            orders: true,
          }
        }
      },
    })

    if (!product) {
      return NextResponse.json({
        ok: false,
        error: '상품을 찾을 수 없습니다.',
      }, { status: 404 })
    }

    return NextResponse.json({
      ok: true,
      data: product,
    })

  } catch (error) {
    console.error('Admin product fetch error:', error)
    return NextResponse.json({
      ok: false,
      error: '상품 정보를 불러오는 중 오류가 발생했습니다.',
    }, { status: 500 })
  }
}

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

    const productId = parseInt(params.id)
    if (isNaN(productId)) {
      return NextResponse.json({
        ok: false,
        error: '유효하지 않은 상품 ID입니다.',
      }, { status: 400 })
    }

    const body = await request.json()
    const validatedData = updateProductSchema.parse(body)

    // 날짜 변환
    const updateData: any = { ...validatedData }
    if (validatedData.startDate) {
      updateData.startDate = new Date(validatedData.startDate)
    }
    if (validatedData.endDate) {
      updateData.endDate = new Date(validatedData.endDate)
    }

    const product = await prisma.product.update({
      where: { id: productId },
      data: updateData,
      include: {
        category: true,
        personTypePrices: true,
      },
    })

    return NextResponse.json({
      ok: true,
      data: product,
    })

  } catch (error) {
    console.error('Admin product update error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        ok: false,
        error: error.errors[0].message,
      }, { status: 400 })
    }

    return NextResponse.json({
      ok: false,
      error: '상품 수정 중 오류가 발생했습니다.',
    }, { status: 500 })
  }
}

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

    const productId = parseInt(params.id)
    if (isNaN(productId)) {
      return NextResponse.json({
        ok: false,
        error: '유효하지 않은 상품 ID입니다.',
      }, { status: 400 })
    }

    // 상품이 존재하는지 확인
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        _count: {
          select: {
            reservations: true,
            orders: true,
          }
        }
      },
    })

    if (!existingProduct) {
      return NextResponse.json({
        ok: false,
        error: '상품을 찾을 수 없습니다.',
      }, { status: 404 })
    }

    // 예약이나 주문이 있는 경우 삭제 방지
    if (existingProduct._count.reservations > 0 || existingProduct._count.orders > 0) {
      return NextResponse.json({
        ok: false,
        error: '예약이나 주문이 있는 상품은 삭제할 수 없습니다. 비활성화를 사용해주세요.',
      }, { status: 400 })
    }

    await prisma.product.delete({
      where: { id: productId },
    })

    return NextResponse.json({
      ok: true,
      message: '상품이 성공적으로 삭제되었습니다.',
    })

  } catch (error) {
    console.error('Admin product delete error:', error)
    return NextResponse.json({
      ok: false,
      error: '상품 삭제 중 오류가 발생했습니다.',
    }, { status: 500 })
  }
}
