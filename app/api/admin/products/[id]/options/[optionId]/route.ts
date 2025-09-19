import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { z } from 'zod'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const updateOptionSchema = z.object({
  name: z.string().min(1, '옵션명을 입력해주세요').optional(),
  sortOrder: z.number().optional(),
  isActive: z.boolean().optional(),
})

// 개별 옵션 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; optionId: string } }
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
    const optionId = parseInt(params.optionId)
    
    if (isNaN(productId) || isNaN(optionId)) {
      return NextResponse.json({
        ok: false,
        error: '유효하지 않은 ID입니다.',
      }, { status: 400 })
    }

    const option = await prisma.productOption.findFirst({
      where: { 
        id: optionId,
        productId: productId
      },
      include: {
        values: {
          orderBy: { sortOrder: 'asc' }
        },
        _count: {
          select: { values: true }
        }
      }
    })

    if (!option) {
      return NextResponse.json({
        ok: false,
        error: '옵션을 찾을 수 없습니다.',
      }, { status: 404 })
    }

    return NextResponse.json({
      ok: true,
      data: option
    })

  } catch (error) {
    console.error('Product option fetch error:', error)
    return NextResponse.json({
      ok: false,
      error: '옵션 정보를 불러오는 중 오류가 발생했습니다.',
    }, { status: 500 })
  }
}

// 개별 옵션 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; optionId: string } }
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
    const optionId = parseInt(params.optionId)
    
    if (isNaN(productId) || isNaN(optionId)) {
      return NextResponse.json({
        ok: false,
        error: '유효하지 않은 ID입니다.',
      }, { status: 400 })
    }

    const body = await request.json()
    const validatedData = updateOptionSchema.parse(body)

    // 옵션 존재 확인
    const existingOption = await prisma.productOption.findFirst({
      where: { 
        id: optionId,
        productId: productId
      }
    })

    if (!existingOption) {
      return NextResponse.json({
        ok: false,
        error: '옵션을 찾을 수 없습니다.',
      }, { status: 404 })
    }

    // 옵션 수정
    const option = await prisma.productOption.update({
      where: { id: optionId },
      data: validatedData,
      include: {
        values: {
          orderBy: { sortOrder: 'asc' }
        },
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
    console.error('Product option update error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        ok: false,
        error: error.errors[0].message,
      }, { status: 400 })
    }

    return NextResponse.json({
      ok: false,
      error: '옵션 수정 중 오류가 발생했습니다.',
    }, { status: 500 })
  }
}

// 개별 옵션 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; optionId: string } }
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
    const optionId = parseInt(params.optionId)
    
    if (isNaN(productId) || isNaN(optionId)) {
      return NextResponse.json({
        ok: false,
        error: '유효하지 않은 ID입니다.',
      }, { status: 400 })
    }

    // 옵션 존재 확인
    const existingOption = await prisma.productOption.findFirst({
      where: { 
        id: optionId,
        productId: productId
      },
      include: {
        _count: {
          select: { values: true }
        }
      }
    })

    if (!existingOption) {
      return NextResponse.json({
        ok: false,
        error: '옵션을 찾을 수 없습니다.',
      }, { status: 404 })
    }

    // 옵션 삭제 (옵션 값들도 함께 삭제됨 - Cascade)
    await prisma.productOption.delete({
      where: { id: optionId }
    })

    return NextResponse.json({
      ok: true,
      message: '옵션이 성공적으로 삭제되었습니다.',
    })

  } catch (error) {
    console.error('Product option delete error:', error)
    return NextResponse.json({
      ok: false,
      error: '옵션 삭제 중 오류가 발생했습니다.',
    }, { status: 500 })
  }
}
