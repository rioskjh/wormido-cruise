import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = parseInt(params.id)

    if (isNaN(productId)) {
      return NextResponse.json({
        ok: false,
        error: '올바르지 않은 상품 ID입니다.',
      }, { status: 400 })
    }

    const product = await prisma.product.findUnique({
      where: { 
        id: productId,
        isActive: true,
      },
      include: {
        category: true,
        personTypePrices: true,
        productOptions: {
          include: {
            values: {
              where: { isActive: true },
              orderBy: { sortOrder: 'asc' },
            },
          },
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
        productSchedules: {
          where: { isActive: true },
        },
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
      data: { product },
    })

  } catch (error) {
    console.error('Product fetch error:', error)
    return NextResponse.json({
      ok: false,
      error: '상품 정보를 불러오는 중 오류가 발생했습니다.',
    }, { status: 500 })
  }
}
