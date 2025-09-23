import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

// 활성 팝업 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const currentPath = searchParams.get('path') || '/'
    
    const now = new Date()

    // 활성 팝업 조회 (날짜 조건, 노출 횟수 조건 포함)
    const popups = await prisma.popup.findMany({
      where: {
        isActive: true,
        AND: [
          {
            OR: [
              { startDate: null },
              { startDate: { lte: now } }
            ]
          },
          {
            OR: [
              { endDate: null },
              { endDate: { gte: now } }
            ]
          },
          {
            OR: [
              { maxShow: null },
              { showCount: { lt: prisma.popup.fields.maxShow } }
            ]
          }
        ]
      },
      orderBy: { zIndex: 'asc' }
    })

    // 페이지 필터링
    const filteredPopups = popups.filter(popup => {
      // 대상 페이지 확인
      if (popup.targetPages) {
        const targetPages = popup.targetPages.split(',').map(page => page.trim())
        if (!targetPages.includes(currentPath) && !targetPages.includes('*')) {
          return false
        }
      }

      // 제외 페이지 확인
      if (popup.excludePages) {
        const excludePages = popup.excludePages.split(',').map(page => page.trim())
        if (excludePages.includes(currentPath) || excludePages.includes('*')) {
          return false
        }
      }

      return true
    })

    // 노출 횟수 업데이트 (비동기로 처리)
    if (filteredPopups.length > 0) {
      const popupIds = filteredPopups.map(popup => popup.id)
      prisma.popup.updateMany({
        where: { id: { in: popupIds } },
        data: { showCount: { increment: 1 } }
      }).catch(error => {
        console.error('Failed to update popup show count:', error)
      })
    }

    return NextResponse.json({
      ok: true,
      data: filteredPopups
    })

  } catch (error) {
    console.error('Active popups error:', error)
    return NextResponse.json({
      ok: false,
      error: '팝업을 불러오는 중 오류가 발생했습니다.'
    }, { status: 500 })
  }
}
