import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAccessToken } from '@/lib/auth'
import { z } from 'zod'

// 이미지 순서 변경
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ ok: false, error: '인증이 필요합니다.' }, { status: 401 })
    }

    const payload = await verifyAccessToken(token)
    if (!payload) {
      return NextResponse.json({ ok: false, error: '유효하지 않은 토큰입니다.' }, { status: 401 })
    }

    const productId = parseInt(params.id)
    if (isNaN(productId)) {
      return NextResponse.json({ ok: false, error: '유효하지 않은 상품 ID입니다.' }, { status: 400 })
    }

    const body = await request.json()
    const reorderSchema = z.object({
      imageOrders: z.array(z.object({
        id: z.number(),
        sortOrder: z.number()
      }))
    })

    const { imageOrders } = reorderSchema.parse(body)

    // 트랜잭션으로 순서 업데이트
    await prisma.$transaction(
      imageOrders.map(({ id, sortOrder }) =>
        prisma.productImage.update({
          where: { id },
          data: { sortOrder }
        })
      )
    )

    // 업데이트된 이미지 목록 반환
    const updatedImages = await prisma.productImage.findMany({
      where: {
        productId,
        isActive: true
      },
      orderBy: {
        sortOrder: 'asc'
      }
    })

    return NextResponse.json({ ok: true, data: updatedImages })
  } catch (error) {
    console.error('Reorder product images error:', error)
    return NextResponse.json({ ok: false, error: '이미지 순서 변경에 실패했습니다.' }, { status: 500 })
  }
}
