import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    // 관리자 인증 확인
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        ok: false,
        error: 'Unauthorized',
      }, { status: 401 })
    }

    const token = authHeader.substring(7)
    console.log('받은 토큰:', token)
    console.log('토큰 길이:', token.length)
    
    const payload = verifyToken(token)
    console.log('검증된 페이로드:', payload)
    
    if (!payload) {
      console.log('토큰 검증 실패')
      return NextResponse.json({
        ok: false,
        error: '토큰 검증 실패',
      }, { status: 401 })
    }
    
    if (payload.role !== 'ADMIN' && payload.role !== 'SUPER_ADMIN') {
      console.log('권한 부족:', payload.role)
      return NextResponse.json({
        ok: false,
        error: '관리자 권한이 필요합니다',
      }, { status: 403 })
    }

    // 통계 데이터 조회
    const [
      totalReservations,
      pendingReservations,
      confirmedReservations,
      cancelledReservations,
      totalRevenue,
    ] = await Promise.all([
      // 총 예약 수
      prisma.reservation.count(),
      
      // 대기 중인 예약 수
      prisma.reservation.count({
        where: { status: 'PENDING' },
      }),
      
      // 확정된 예약 수
      prisma.reservation.count({
        where: { status: 'CONFIRMED' },
      }),
      
      // 취소된 예약 수
      prisma.reservation.count({
        where: { status: 'CANCELLED' },
      }),
      
      // 총 매출 (확정된 예약의 총 금액)
      prisma.reservation.aggregate({
        where: { status: 'CONFIRMED' },
        _sum: { totalAmount: true },
      }),
    ])

    const stats = {
      totalReservations,
      pendingReservations,
      confirmedReservations,
      cancelledReservations,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
    }

    return NextResponse.json({
      ok: true,
      data: stats,
    })

  } catch (error) {
    console.error('Dashboard stats error:', error)
    
    return NextResponse.json({
      ok: false,
      error: '통계 데이터를 불러오는데 실패했습니다.',
    }, { status: 500 })
  }
}
