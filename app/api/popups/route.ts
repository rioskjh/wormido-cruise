import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

// 활성 팝업 조회
export async function GET(request: NextRequest) {
  try {
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

    // 모든 활성 팝업 반환 (클라이언트에서 필터링)
    return NextResponse.json({
      ok: true,
      data: popups
    })

  } catch (error) {
    console.error('Active popups error:', error)
    return NextResponse.json({
      ok: false,
      error: '팝업을 불러오는 중 오류가 발생했습니다.'
    }, { status: 500 })
  }
}
