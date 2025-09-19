import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { z } from 'zod'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const createOptionValueSchema = z.object({
  value: z.string().min(1, '옵션 값을 입력해주세요'),
  price: z.number().default(0),
  isActive: z.boolean().default(true),
  sortOrder: z.number().default(0),
})

const updateOptionValueSchema = z.object({
  value: z.string().min(1, '옵션 값을 입력해주세요').optional(),
  price: z.number().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().optional(),
})

// 옵션 값 목록 조회
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

    // 옵션 존재 확인
    const option = await prisma.productOption.findFirst({
      where: { 
        id: optionId,
        productId: productId
      },
      select: { id: true, name: true }
    })

    if (!option) {
      return NextResponse.json({
        ok: false,
        error: '옵션을 찾을 수 없습니다.',
      }, { status: 404 })
    }

    // 옵션 값 목록 조회
    const values = await prisma.productOptionValue.findMany({
      where: { optionId },
      orderBy: { sortOrder: 'asc' }
    })

    return NextResponse.json({
      ok: true,
      data: {
        option,
        values
      }
    })

  } catch (error) {
    console.error('Option values fetch error:', error)
    return NextResponse.json({
      ok: false,
      error: '옵션 값 목록을 불러오는 중 오류가 발생했습니다.',
    }, { status: 500 })
  }
}

// 옵션 값 생성
export async function POST(
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
    const validatedData = createOptionValueSchema.parse(body)

    // 옵션 존재 확인
    const option = await prisma.productOption.findFirst({
      where: { 
        id: optionId,
        productId: productId
      }
    })

    if (!option) {
      return NextResponse.json({
        ok: false,
        error: '옵션을 찾을 수 없습니다.',
      }, { status: 404 })
    }

    // 중복 검증 - 같은 옵션에 동일한 값이 있는지 확인
    const existingValue = await prisma.productOptionValue.findFirst({
      where: {
        optionId,
        value: {
          equals: validatedData.value,
          mode: 'insensitive' // 대소문자 구분 없이 검사
        }
      }
    })

    if (existingValue) {
      return NextResponse.json({
        ok: false,
        error: `"${validatedData.value}"는 이미 등록된 옵션 값입니다.`,
      }, { status: 400 })
    }

    // 옵션 값 생성
    const value = await prisma.productOptionValue.create({
      data: {
        ...validatedData,
        optionId
      }
    })

    return NextResponse.json({
      ok: true,
      data: value
    })

  } catch (error) {
    console.error('Option value create error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        ok: false,
        error: error.errors[0].message,
      }, { status: 400 })
    }

    return NextResponse.json({
      ok: false,
      error: '옵션 값 생성 중 오류가 발생했습니다.',
    }, { status: 500 })
  }
}
