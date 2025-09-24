import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    // 필터 조건 구성
    const where: any = {
      isActive: true,
    }

    if (category) {
      where.categoryId = parseInt(category)
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    // 상품 목록 조회 (detail_html 컬럼이 없으므로 select로 명시적 선택)
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        select: {
          id: true,
          name: true,
          description: true,
          categoryId: true,
          basePrice: true,
          adultPrice: true,
          childPrice: true,
          infantPrice: true,
          maxCapacity: true,
          currentBookings: true,
          isActive: true,
          useOptions: true,
          startDate: true,
          endDate: true,
          createdAt: true,
          updatedAt: true,
          category: true,
          personTypePrices: true,
          images: {
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
            take: 1, // 첫 번째 이미지만 가져오기
          },
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
    console.error('Products fetch error:', error)
    return NextResponse.json({
      ok: false,
      error: '상품 목록을 불러오는 중 오류가 발생했습니다.',
    }, { status: 500 })
  }
}