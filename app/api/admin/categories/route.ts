import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { z } from 'zod'

export const runtime = 'nodejs'

const createCategorySchema = z.object({
  name: z.string().min(1, '카테고리명을 입력해주세요'),
  description: z.string().optional(),
  sortOrder: z.number().optional().default(0),
  isActive: z.boolean().optional().default(true),
})

const updateCategorySchema = z.object({
  name: z.string().min(1, '카테고리명을 입력해주세요').optional(),
  description: z.string().optional(),
  sortOrder: z.number().optional(),
  isActive: z.boolean().optional(),
})

// 카테고리 목록 조회
export async function GET(request: NextRequest) {
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

    // 카테고리 목록 조회 (정렬 순서대로)
    const categories = await prisma.category.findMany({
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'asc' }
      ],
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
      data: categories,
    })

  } catch (error) {
    console.error('Categories fetch error:', error)
    
    return NextResponse.json({
      ok: false,
      error: '카테고리 목록을 불러오는데 실패했습니다.',
    }, { status: 500 })
  }
}

// 새 카테고리 생성
export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { name, description, sortOrder, isActive } = createCategorySchema.parse(body)

    // 카테고리명 중복 확인
    const existingCategory = await prisma.category.findFirst({
      where: { name }
    })

    if (existingCategory) {
      return NextResponse.json({
        ok: false,
        error: '이미 존재하는 카테고리명입니다.',
      }, { status: 400 })
    }

    // 새 카테고리 생성
    const category = await prisma.category.create({
      data: {
        name,
        description,
        sortOrder,
        isActive,
      }
    })

    return NextResponse.json({
      ok: true,
      data: category,
    })

  } catch (error) {
    console.error('Category creation error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        ok: false,
        error: error.errors[0].message,
      }, { status: 400 })
    }

    return NextResponse.json({
      ok: false,
      error: '카테고리 생성에 실패했습니다.',
    }, { status: 500 })
  }
}
