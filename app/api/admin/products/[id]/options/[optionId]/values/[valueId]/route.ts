import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { z } from 'zod'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const updateOptionValueSchema = z.object({
  value: z.string().min(1, '옵션 값을 입력해주세요').optional(),
  price: z.number().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().optional(),
})

// 개별 옵션 값 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; optionId: string; valueId: string } }
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
    const valueId = parseInt(params.valueId)
    
    if (isNaN(productId) || isNaN(optionId) || isNaN(valueId)) {
      return NextResponse.json({
        ok: false,
        error: '유효하지 않은 ID입니다.',
      }, { status: 400 })
    }

    const value = await prisma.productOptionValue.findFirst({
      where: { 
        id: valueId,
        option: {
          id: optionId,
          productId: productId
        }
      }
    })

    if (!value) {
      return NextResponse.json({
        ok: false,
        error: '옵션 값을 찾을 수 없습니다.',
      }, { status: 404 })
    }

    return NextResponse.json({
      ok: true,
      data: value
    })

  } catch (error) {
    console.error('Option value fetch error:', error)
    return NextResponse.json({
      ok: false,
      error: '옵션 값 정보를 불러오는 중 오류가 발생했습니다.',
    }, { status: 500 })
  }
}

// 개별 옵션 값 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; optionId: string; valueId: string } }
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
    const valueId = parseInt(params.valueId)
    
    if (isNaN(productId) || isNaN(optionId) || isNaN(valueId)) {
      return NextResponse.json({
        ok: false,
        error: '유효하지 않은 ID입니다.',
      }, { status: 400 })
    }

    const body = await request.json()
    const validatedData = updateOptionValueSchema.parse(body)

    // 옵션 값 존재 확인
    const existingValue = await prisma.productOptionValue.findFirst({
      where: { 
        id: valueId,
        option: {
          id: optionId,
          productId: productId
        }
      }
    })

    if (!existingValue) {
      return NextResponse.json({
        ok: false,
        error: '옵션 값을 찾을 수 없습니다.',
      }, { status: 404 })
    }

    // 옵션 값 수정
    const value = await prisma.productOptionValue.update({
      where: { id: valueId },
      data: validatedData
    })

    return NextResponse.json({
      ok: true,
      data: value
    })

  } catch (error) {
    console.error('Option value update error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        ok: false,
        error: error.errors[0].message,
      }, { status: 400 })
    }

    return NextResponse.json({
      ok: false,
      error: '옵션 값 수정 중 오류가 발생했습니다.',
    }, { status: 500 })
  }
}

// 개별 옵션 값 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; optionId: string; valueId: string } }
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
    const valueId = parseInt(params.valueId)
    
    if (isNaN(productId) || isNaN(optionId) || isNaN(valueId)) {
      return NextResponse.json({
        ok: false,
        error: '유효하지 않은 ID입니다.',
      }, { status: 400 })
    }

    // 옵션 값 존재 확인
    const existingValue = await prisma.productOptionValue.findFirst({
      where: { 
        id: valueId,
        option: {
          id: optionId,
          productId: productId
        }
      }
    })

    if (!existingValue) {
      return NextResponse.json({
        ok: false,
        error: '옵션 값을 찾을 수 없습니다.',
      }, { status: 404 })
    }

    // 옵션 값 삭제
    await prisma.productOptionValue.delete({
      where: { id: valueId }
    })

    return NextResponse.json({
      ok: true,
      message: '옵션 값이 성공적으로 삭제되었습니다.',
    })

  } catch (error) {
    console.error('Option value delete error:', error)
    return NextResponse.json({
      ok: false,
      error: '옵션 값 삭제 중 오류가 발생했습니다.',
    }, { status: 500 })
  }
}
