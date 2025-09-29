import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 공개 카테고리 목록 조회 (네비게이션용)
export async function GET(request: NextRequest) {
  try {
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

    return NextResponse.json({
      ok: true,
      data: categories
    })
  } catch (error) {
    console.error('카테고리 조회 오류:', error)
    return NextResponse.json({
      ok: false,
      error: '카테고리 조회 중 오류가 발생했습니다.'
    }, { status: 500 })
  }
}
