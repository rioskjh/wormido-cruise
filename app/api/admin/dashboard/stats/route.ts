import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // 관리자 인증 확인
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.warn('API: Missing or malformed Authorization header')
      return NextResponse.json({
        ok: false,
        error: '인증 토큰이 필요합니다.',
      }, { status: 401 })
    }

    const token = authHeader.substring(7)
    let payload = null
    try {
      payload = verifyToken(token)
    } catch (e) {
      console.error('API: Token verification failed:', e)
      return NextResponse.json({
        ok: false,
        error: '유효하지 않은 토큰입니다.',
      }, { status: 401 })
    }
    
    if (!payload || (payload.role !== 'ADMIN' && payload.role !== 'SUPER_ADMIN')) {
      console.warn('API: Invalid payload or insufficient role', payload)
      return NextResponse.json({
        ok: false,
        error: '관리자 권한이 필요합니다.',
      }, { status: 403 })
    }

    // 대시보드 통계 데이터 조회
    const [
      totalReservations,
      pendingReservations,
      confirmedReservations,
      cancelledReservations,
      totalRevenue,
      totalProducts,
      totalMembers,
      recentReservations
    ] = await Promise.all([
      // 전체 예약 수
      prisma.reservation.count(),
      
      // 대기 중인 예약 수
      prisma.reservation.count({
        where: { status: 'PENDING' }
      }),
      
      // 확정된 예약 수
      prisma.reservation.count({
        where: { status: 'CONFIRMED' }
      }),
      
      // 취소된 예약 수
      prisma.reservation.count({
        where: { status: 'CANCELLED' }
      }),
      
      // 총 매출 (확정된 예약의 총 금액)
      prisma.reservation.aggregate({
        where: { status: 'CONFIRMED' },
        _sum: { totalAmount: true }
      }),
      
      // 전체 상품 수
      prisma.product.count(),
      
      // 전체 회원 수
      prisma.member.count(),
      
      // 최근 예약 5건
      prisma.reservation.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          product: {
            select: { name: true }
          }
        }
      })
    ])

    const stats = {
      totalReservations,
      pendingReservations,
      confirmedReservations,
      cancelledReservations,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      totalProducts,
      totalMembers,
      recentReservations
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