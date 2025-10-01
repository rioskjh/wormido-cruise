import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = parseInt(params.id)

    if (isNaN(productId)) {
      return NextResponse.json({
        ok: false,
        error: '유효하지 않은 상품 ID입니다.',
      }, { status: 400 })
    }

    // 상품 정보 조회 (옵션 및 이미지 포함)
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        name: true,
        description: true,
        detailHtml: true,
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
        images: {
          orderBy: { sortOrder: 'asc' }
        },
        options: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          include: {
            values: {
              where: { isActive: true },
              orderBy: { sortOrder: 'asc' }
            }
          }
        }
      }
    })

    if (!product) {
      return NextResponse.json({
        ok: false,
        error: '상품을 찾을 수 없습니다.',
      }, { status: 404 })
    }

    if (!product.isActive) {
      return NextResponse.json({
        ok: false,
        error: '현재 판매하지 않는 상품입니다.',
      }, { status: 400 })
    }

    // 이용 가능한 날짜 생성
    const generateAvailableDates = (startDate: Date | null, endDate: Date | null): string[] => {
      if (!startDate || !endDate) {
        // 날짜가 설정되지 않은 경우, 향후 30일간의 날짜를 생성
        const dates: string[] = []
        const today = new Date()
        for (let i = 0; i < 30; i++) {
          const date = new Date(today)
          date.setDate(today.getDate() + i)
          dates.push(date.toISOString().split('T')[0])
        }
        return dates
      }

      const dates: string[] = []
      const current = new Date(startDate)
      const end = new Date(endDate)
      
      while (current <= end) {
        dates.push(current.toISOString().split('T')[0])
        current.setDate(current.getDate() + 1)
      }
      
      return dates
    }

    const availableDates = generateAvailableDates(product.startDate, product.endDate)

    // 응답 데이터 구성
    const responseData = {
      product: {
        id: product.id,
        name: product.name,
        description: product.description,
        detailHtml: product.detailHtml,
        basePrice: product.basePrice,
        adultPrice: product.adultPrice,
        childPrice: product.childPrice,
        infantPrice: product.infantPrice,
        maxCapacity: product.maxCapacity,
        currentBookings: product.currentBookings,
        useOptions: product.useOptions,
        availableDates,
        category: product.category,
        images: product.images.map(image => ({
          id: image.id,
          fileName: image.fileName,
          filePath: image.filePath,
          sortOrder: image.sortOrder
        })),
        options: product.options.map(option => ({
          id: option.id,
          name: option.name,
          values: option.values.map(value => ({
            id: value.id,
            value: value.value,
            price: value.price
          }))
        }))
      }
    }

    return NextResponse.json({
      ok: true,
      data: responseData
    })

  } catch (error) {
    console.error('Product detail fetch error:', error)
    
    return NextResponse.json({
      ok: false,
      error: '상품 정보를 불러오는 중 오류가 발생했습니다.',
    }, { status: 500 })
  }
}