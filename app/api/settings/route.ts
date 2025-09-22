import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// 공개 설정 조회 (인증 불필요)
export async function GET() {
  try {
    // 모든 활성 설정 조회
    const settings = await prisma.siteSettings.findMany({
      where: { isActive: true },
      orderBy: [
        { category: 'asc' },
        { key: 'asc' }
      ]
    })

    return NextResponse.json({
      ok: true,
      data: { settings }
    })

  } catch (error) {
    console.error('Public settings fetch error:', error)
    
    return NextResponse.json({
      ok: false,
      error: '설정을 불러오는 중 오류가 발생했습니다.',
    }, { status: 500 })
  }
}
