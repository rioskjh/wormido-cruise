import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { z } from 'zod'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const createProductSchema = z.object({
  name: z.string().min(1, '상품명을 입력해주세요'),
  description: z.string().optional(),
  detailHtml: z.string().optional(),
  categoryId: z.number().optional(),
  basePrice: z.number().min(0, '기본 가격은 0 이상이어야 합니다'),
  adultPrice: z.number().min(0, '성인 가격은 0 이상이어야 합니다'),
  childPrice: z.number().min(0, '아동 가격은 0 이상이어야 합니다'),
  infantPrice: z.number().min(0, '유아 가격은 0 이상이어야 합니다'),
  maxCapacity: z.number().min(1, '최대 수용 인원은 1명 이상이어야 합니다'),
  isActive: z.boolean().default(true),
  useOptions: z.boolean().default(false),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
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
    
    if (!payload || (payload.role !== 'ADMIN' && payload.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({
        ok: false,
        error: '관리자 권한이 필요합니다.',
      }, { status: 403 })
    }

    const { searchParams } = request.nextUrl
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const categoryId = searchParams.get('categoryId')
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    // 필터 조건 구성
    const where: any = {}

    if (categoryId) {
      where.categoryId = parseInt(categoryId)
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    // 상품 목록 조회
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          personTypePrices: true,
          images: {
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
            take: 1, // 첫 번째 이미지만 가져오기
          },
          _count: {
            select: {
              reservations: true,
              orders: true,
            }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ])

    return NextResponse.json({
      ok: true,
      data: {
        products,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    })

  } catch (error) {
    console.error('Admin products fetch error:', error)
    return NextResponse.json({
      ok: false,
      error: '상품 목록을 불러오는 중 오류가 발생했습니다.',
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const validatedData = createProductSchema.parse(body)

    // 날짜 변환
    const productData = {
      ...validatedData,
      startDate: validatedData.startDate ? new Date(validatedData.startDate) : null,
      endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
    }

    const product = await prisma.product.create({
      data: productData,
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
    console.error('Admin product create error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        ok: false,
        error: error.errors[0].message,
      }, { status: 400 })
    }

    return NextResponse.json({
      ok: false,
      error: '상품 생성 중 오류가 발생했습니다.',
    }, { status: 500 })
  }
}
