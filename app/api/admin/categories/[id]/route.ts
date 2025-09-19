import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { z } from 'zod'

export const runtime = 'nodejs'

const updateCategorySchema = z.object({
  name: z.string().min(1, '카테고리명을 입력해주세요').optional(),
  description: z.string().optional(),
  sortOrder: z.number().optional(),
  isActive: z.boolean().optional(),
})

// 특정 카테고리 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 관리자 인증 확인
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        ok: false,
        error: 'Unauthorized',
      }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const payload = verifyToken(token)
    
    if (!payload || (payload.role !== 'ADMIN' && payload.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({
        ok: false,
        error: '관리자 권한이 필요합니다',
      }, { status: 403 })
    }

    const categoryId = parseInt(params.id)
    if (isNaN(categoryId)) {
      return NextResponse.json({
        ok: false,
        error: '유효하지 않은 카테고리 ID입니다.',
      }, { status: 400 })
    }

    // 카테고리 조회
    const category = await prisma.productCategory.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: {
            products: true
          }
        }
      }
    })

    if (!category) {
      return NextResponse.json({
        ok: false,
        error: '카테고리를 찾을 수 없습니다.',
      }, { status: 404 })
    }

    return NextResponse.json({
      ok: true,
      data: category,
    })

  } catch (error) {
    console.error('Category fetch error:', error)
    
    return NextResponse.json({
      ok: false,
      error: '카테고리 정보를 불러오는데 실패했습니다.',
    }, { status: 500 })
  }
}

// 카테고리 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 관리자 인증 확인
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        ok: false,
        error: 'Unauthorized',
      }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const payload = verifyToken(token)
    
    if (!payload || (payload.role !== 'ADMIN' && payload.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({
        ok: false,
        error: '관리자 권한이 필요합니다',
      }, { status: 403 })
    }

    const categoryId = parseInt(params.id)
    if (isNaN(categoryId)) {
      return NextResponse.json({
        ok: false,
        error: '유효하지 않은 카테고리 ID입니다.',
      }, { status: 400 })
    }

    const body = await request.json()
    const updateData = updateCategorySchema.parse(body)

    // 카테고리 존재 확인
    const existingCategory = await prisma.productCategory.findUnique({
      where: { id: categoryId }
    })

    if (!existingCategory) {
      return NextResponse.json({
        ok: false,
        error: '카테고리를 찾을 수 없습니다.',
      }, { status: 404 })
    }

    // 카테고리명 중복 확인 (자기 자신 제외)
    if (updateData.name && updateData.name !== existingCategory.name) {
      const duplicateCategory = await prisma.productCategory.findFirst({
        where: { 
          name: updateData.name,
          id: { not: categoryId }
        }
      })

      if (duplicateCategory) {
        return NextResponse.json({
          ok: false,
          error: '이미 존재하는 카테고리명입니다.',
        }, { status: 400 })
      }
    }

    // 카테고리 수정
    const updatedCategory = await prisma.productCategory.update({
      where: { id: categoryId },
      data: updateData,
      include: {
        _count: {
          select: {
            products: true
          }
        }
      }
    })

    return NextResponse.json({
      ok: true,
      data: updatedCategory,
    })

  } catch (error) {
    console.error('Category update error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        ok: false,
        error: error.errors[0].message,
      }, { status: 400 })
    }

    return NextResponse.json({
      ok: false,
      error: '카테고리 수정에 실패했습니다.',
    }, { status: 500 })
  }
}

// 카테고리 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 관리자 인증 확인
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        ok: false,
        error: 'Unauthorized',
      }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const payload = verifyToken(token)
    
    if (!payload || (payload.role !== 'ADMIN' && payload.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({
        ok: false,
        error: '관리자 권한이 필요합니다',
      }, { status: 403 })
    }

    const categoryId = parseInt(params.id)
    if (isNaN(categoryId)) {
      return NextResponse.json({
        ok: false,
        error: '유효하지 않은 카테고리 ID입니다.',
      }, { status: 400 })
    }

    // 카테고리 존재 확인
    const existingCategory = await prisma.productCategory.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: {
            products: true
          }
        }
      }
    })

    if (!existingCategory) {
      return NextResponse.json({
        ok: false,
        error: '카테고리를 찾을 수 없습니다.',
      }, { status: 404 })
    }

    // 연결된 상품이 있는지 확인
    if (existingCategory._count.products > 0) {
      return NextResponse.json({
        ok: false,
        error: `이 카테고리에 연결된 상품이 ${existingCategory._count.products}개 있습니다. 먼저 상품을 다른 카테고리로 이동하거나 삭제해주세요.`,
      }, { status: 400 })
    }

    // 카테고리 삭제
    await prisma.productCategory.delete({
      where: { id: categoryId }
    })

    return NextResponse.json({
      ok: true,
      message: '카테고리가 성공적으로 삭제되었습니다.',
    })

  } catch (error) {
    console.error('Category deletion error:', error)
    
    return NextResponse.json({
      ok: false,
      error: '카테고리 삭제에 실패했습니다.',
    }, { status: 500 })
  }
}
