import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET: 공개 네비게이션 조회 (계층 구조)
export async function GET(request: NextRequest) {
  try {
    const navigations = await prisma.navigation.findMany({
      where: {
        isActive: true
      },
      include: {
        children: {
          where: {
            isActive: true
          },
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
