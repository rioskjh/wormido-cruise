import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminToken } from '@/lib/auth'
import { z } from 'zod'

// 네비게이션 수정 스키마
const navigationUpdateSchema = z.object({
  title: z.string().min(1, '제목은 필수입니다').optional(),
  url: z.string().optional(),
  type: z.enum(['CUSTOM', 'PRODUCTS', 'BOARD', 'CONTENT', 'EXTERNAL']).optional(),
  targetId: z.number().optional(),
  parentId: z.number().optional(),
  sortOrder: z.number().optional(),
  isActive: z.boolean().optional(),
  isNewWindow: z.boolean().optional()
})

// GET: 특정 네비게이션 조회
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const result = await verifyAdminToken(request)
    if (!result.ok || !result.payload || (result.payload.role !== 'ADMIN' && result.payload.role !== 'EDITOR')) {
      return NextResponse.json({
        ok: false,
        error: '관리자 권한이 필요합니다.',
      }, { status: 403 })
    }

    const navigation = await prisma.navigation.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        children: {
          orderBy: { sortOrder: 'asc' }
        }
      }
    })

    if (!navigation) {
      return NextResponse.json({
        ok: false,
        error: '네비게이션을 찾을 수 없습니다.'
      }, { status: 404 })
    }

    return NextResponse.json({
      ok: true,
      data: navigation
    })
  } catch (error) {
    console.error('네비게이션 조회 오류:', error)
    return NextResponse.json({
      ok: false,
      error: '네비게이션 조회 중 오류가 발생했습니다.'
    }, { status: 500 })
  }
}

// PUT: 네비게이션 수정
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const result = await verifyAdminToken(request)
    if (!result.ok || !result.payload || (result.payload.role !== 'ADMIN' && result.payload.role !== 'EDITOR')) {
      return NextResponse.json({
        ok: false,
        error: '관리자 권한이 필요합니다.',
      }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = navigationUpdateSchema.parse(body)

    // 기존 네비게이션 확인
    const existingNavigation = await prisma.navigation.findUnique({
      where: { id: parseInt(params.id) }
    })

    if (!existingNavigation) {
      return NextResponse.json({
        ok: false,
        error: '네비게이션을 찾을 수 없습니다.'
      }, { status: 404 })
    }

    // 최대 6개 메뉴 제한 확인 (최상위 메뉴로 변경하는 경우)
    if (validatedData.parentId === null && existingNavigation.parentId !== null) {
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

    const updatedNavigation = await prisma.navigation.update({
      where: { id: parseInt(params.id) },
      data: {
        ...validatedData,
        ...(finalUrl && { url: finalUrl })
      },
      include: {
        children: {
          orderBy: { sortOrder: 'asc' }
        }
      }
    })

    return NextResponse.json({
      ok: true,
      data: updatedNavigation
    })
  } catch (error) {
    console.error('네비게이션 수정 오류:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        ok: false,
        error: error.errors[0].message
      }, { status: 400 })
    }
    return NextResponse.json({
      ok: false,
      error: '네비게이션 수정 중 오류가 발생했습니다.'
    }, { status: 500 })
  }
}

// DELETE: 네비게이션 삭제
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const result = await verifyAdminToken(request)
    if (!result.ok || !result.payload || (result.payload.role !== 'ADMIN' && result.payload.role !== 'EDITOR')) {
      return NextResponse.json({
        ok: false,
        error: '관리자 권한이 필요합니다.',
      }, { status: 403 })
    }

    const navigation = await prisma.navigation.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        children: true
      }
    })

    if (!navigation) {
      return NextResponse.json({
        ok: false,
        error: '네비게이션을 찾을 수 없습니다.'
      }, { status: 404 })
    }

    // 하위 메뉴가 있는 경우 삭제 불가
    if (navigation.children.length > 0) {
      return NextResponse.json({
        ok: false,
        error: '하위 메뉴가 있는 경우 삭제할 수 없습니다. 먼저 하위 메뉴를 삭제해주세요.'
      }, { status: 400 })
    }

    await prisma.navigation.delete({
      where: { id: parseInt(params.id) }
    })

    return NextResponse.json({
      ok: true,
      message: '네비게이션이 삭제되었습니다.'
    })
  } catch (error) {
    console.error('네비게이션 삭제 오류:', error)
    return NextResponse.json({
      ok: false,
      error: '네비게이션 삭제 중 오류가 발생했습니다.'
    }, { status: 500 })
  }
}
