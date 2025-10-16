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

    // 상품 메뉴인 경우 카테고리를 2차 메뉴로 추가
    const navigationsWithCategories = await Promise.all(
      topLevelNavigations.map(async (nav) => {
        if (nav.type === 'PRODUCTS') {
          // 활성화된 카테고리 목록 조회
          const categories = await prisma.category.findMany({
            where: {
              isActive: true
            },
            orderBy: [
              { sortOrder: 'asc' },
              { createdAt: 'asc' }
            ],
            select: {
              id: true,
              name: true,
              sortOrder: true
            }
          })

          // 카테고리를 2차 메뉴 형태로 변환
          const categoryMenus = categories.map(category => ({
            id: `category_${category.id}`,
            title: category.name,
            url: `/products?category=${category.id}`,
            type: 'CUSTOM' as const,
            targetId: category.id,
            parentId: nav.id,
            sortOrder: category.sortOrder,
            isActive: true,
            isNewWindow: false,
            children: []
          }))

          return {
            ...nav,
            children: [...nav.children, ...categoryMenus]
          }
        }
        return nav
      })
    )

    return NextResponse.json({
      ok: true,
      data: navigationsWithCategories,
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Last-Modified': new Date().toUTCString()
      }
    })
  } catch (error) {
    console.error('네비게이션 조회 오류:', error)
    return NextResponse.json({
      ok: false,
      error: '네비게이션 조회 중 오류가 발생했습니다.'
    }, { status: 500 })
  }
}
