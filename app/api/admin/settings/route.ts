import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminToken } from '@/lib/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// 설정 조회
export async function GET(request: NextRequest) {
  try {
    // 관리자 인증 확인
    const authResult = await verifyAdminToken(request)
    if (!authResult.ok) {
      return NextResponse.json({
        ok: false,
        error: authResult.error
      }, { status: 401 })
    }

    // 모든 설정 조회
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
    console.error('Settings fetch error:', error)
    
    return NextResponse.json({
      ok: false,
      error: '설정을 불러오는 중 오류가 발생했습니다.',
    }, { status: 500 })
  }
}

// 설정 업데이트
export async function PUT(request: NextRequest) {
  try {
    // 관리자 인증 확인
    const authResult = await verifyAdminToken(request)
    if (!authResult.ok) {
      return NextResponse.json({
        ok: false,
        error: authResult.error
      }, { status: 401 })
    }

    const { settings } = await request.json()

    if (!settings || !Array.isArray(settings)) {
      return NextResponse.json({
        ok: false,
        error: '잘못된 요청 데이터입니다.',
      }, { status: 400 })
    }

    // 각 설정 업데이트
    const updatePromises = settings.map((setting: any) =>
      prisma.siteSettings.update({
        where: { id: setting.id },
        data: { 
          value: setting.value,
          updatedAt: new Date()
        }
      })
    )

    await Promise.all(updatePromises)

    return NextResponse.json({
      ok: true,
      message: '설정이 성공적으로 업데이트되었습니다.'
    })

  } catch (error) {
    console.error('Settings update error:', error)
    
    return NextResponse.json({
      ok: false,
      error: '설정 업데이트 중 오류가 발생했습니다.',
    }, { status: 500 })
  }
}
