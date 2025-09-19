import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { z } from 'zod'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const createOptionSchema = z.object({
  name: z.string().min(1, '옵션명을 입력해주세요'),
  sortOrder: z.number().default(0),
  isActive: z.boolean().default(true),
})

const updateOptionSchema = z.object({
  name: z.string().min(1, '옵션명을 입력해주세요').optional(),
  sortOrder: z.number().optional(),
  isActive: z.boolean().optional(),
})

// 상품 옵션 목록 조회
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

    // 상품 옵션 목록 조회
    const options = await prisma.productOption.findMany({
      where: { productId },
      include: {
        values: {
          orderBy: { sortOrder: 'asc' }
        },
        _count: {
          select: { values: true }
        }
      },
      orderBy: { sortOrder: 'asc' }
    })

    return NextResponse.json({
      ok: true,
      data: {
        product,
        options
      }
    })

  } catch (error) {
    console.error('Product options fetch error:', error)
    return NextResponse.json({
      ok: false,
      error: '상품 옵션 목록을 불러오는 중 오류가 발생했습니다.',
    }, { status: 500 })
  }
}

// 상품 옵션 생성
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
    const validatedData = createOptionSchema.parse(body)

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

    // 옵션 생성
    const option = await prisma.productOption.create({
      data: {
        ...validatedData,
        productId
      },
      include: {
        values: true,
        _count: {
          select: { values: true }
        }
      }
    })

    return NextResponse.json({
      ok: true,
      data: option
    })

  } catch (error) {
    console.error('Product option create error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        ok: false,
        error: error.errors[0].message,
      }, { status: 400 })
    }

    return NextResponse.json({
      ok: false,
      error: '상품 옵션 생성 중 오류가 발생했습니다.',
    }, { status: 500 })
  }
}
