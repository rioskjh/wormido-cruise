import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminToken } from '@/lib/auth'
import { z } from 'zod'

// 네비게이션 생성/수정 스키마
const navigationSchema = z.object({
  title: z.string().min(1, '제목은 필수입니다'),
  url: z.string().optional(),
  type: z.enum(['CUSTOM', 'PRODUCTS', 'BOARD', 'CONTENT', 'EXTERNAL']),
  targetId: z.number().optional(),
  parentId: z.number().optional(),
  sortOrder: z.number().default(0),
  isActive: z.boolean().default(true),
  isNewWindow: z.boolean().default(false)
})

// GET: 모든 네비게이션 조회 (계층 구조)
export async function GET(request: NextRequest) {
  try {
    const result = await verifyAdminToken(request)
    if (!result.ok || !result.payload || (result.payload.role !== 'ADMIN' && result.payload.role !== 'EDITOR')) {
      return NextResponse.json({
        ok: false,
        error: '관리자 권한이 필요합니다.',
      }, { status: 403 })
    }

    const navigations = await prisma.navigation.findMany({
      include: {
        children: {
          orderBy: { sortOrder: 'asc' }
        }
      },
      orderBy: { sortOrder: 'asc' }
    })

    // 최상위 메뉴만 필터링
    const topLevelNavigations = navigations.filter(nav => !nav.parentId)

    return NextResponse.json({
      ok: true,
      data: topLevelNavigations
    })
  } catch (error) {
    console.error('네비게이션 조회 오류:', error)
    return NextResponse.json({
      ok: false,
      error: '네비게이션 조회 중 오류가 발생했습니다.'
    }, { status: 500 })
  }
}

// POST: 새 네비게이션 생성
export async function POST(request: NextRequest) {
  try {
    const result = await verifyAdminToken(request)
    if (!result.ok || !result.payload || (result.payload.role !== 'ADMIN' && result.payload.role !== 'EDITOR')) {
      return NextResponse.json({
        ok: false,
        error: '관리자 권한이 필요합니다.',
      }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = navigationSchema.parse(body)

    // 최대 6개 메뉴 제한 확인
    if (!validatedData.parentId) {
      const topLevelCount = await prisma.navigation.count({
        where: { parentId: null }
      })
      if (topLevelCount >= 6) {
        return NextResponse.json({
          ok: false,
          error: '최상위 메뉴는 최대 6개까지 등록 가능합니다.'
        }, { status: 400 })
      }
    }

    // URL 생성 로직
    let finalUrl = validatedData.url
    if (validatedData.type === 'PRODUCTS') {
      finalUrl = '/products'
    } else if (validatedData.type === 'BOARD') {
      finalUrl = '/board'
    } else if (validatedData.type === 'CONTENT' && validatedData.targetId) {
      const content = await prisma.content.findUnique({
        where: { id: validatedData.targetId }
      })
      if (content) {
        finalUrl = `/contents/${content.slug}`
      }
    }

    const navigation = await prisma.navigation.create({
      data: {
        ...validatedData,
        url: finalUrl
      },
      include: {
        children: true
      }
    })

    return NextResponse.json({
      ok: true,
      data: navigation
    })
  } catch (error) {
    console.error('네비게이션 생성 오류:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        ok: false,
        error: error.errors[0].message
      }, { status: 400 })
    }
    return NextResponse.json({
      ok: false,
      error: '네비게이션 생성 중 오류가 발생했습니다.'
    }, { status: 500 })
  }
}
