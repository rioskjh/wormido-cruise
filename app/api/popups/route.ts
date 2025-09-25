import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

// 활성 팝업 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const currentPath = searchParams.get('path') || '/'
    
    const now = new Date()

    // 활성 팝업 조회 (날짜 조건만 포함)
    const popups = await prisma.popup.findMany({
      where: {
        isActive: true,
        AND: [
          {
            startDate: { lte: now }
          },
          {
            endDate: { gte: now }
          }
        ]
      },
      orderBy: { zIndex: 'asc' }
    })

    // 메인 페이지에서만 팝업 노출
    const filteredPopups = popups.filter(popup => {
      // 메인 페이지(/)에서만 노출
      return currentPath === '/'
    })

    // 노출 횟수 업데이트는 제거 (성능 최적화)
    // 필요시 별도 API로 분리하여 처리

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
