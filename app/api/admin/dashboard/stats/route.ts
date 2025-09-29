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
      console.log('Admin auth failed:', { payload, role: payload?.role })
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
      
      // 대기 중인 예약 수 (raw SQL 사용 - enum 타입 문제 임시 해결)
      prisma.$queryRaw`SELECT COUNT(*)::int as count FROM reservations WHERE status = 'PENDING'`.then((result: any) => result[0]?.count || 0),
      
      // 확정된 예약 수 (raw SQL 사용)
      prisma.$queryRaw`SELECT COUNT(*)::int as count FROM reservations WHERE status = 'CONFIRMED'`.then((result: any) => result[0]?.count || 0),
      
      // 취소된 예약 수 (raw SQL 사용)
      prisma.$queryRaw`SELECT COUNT(*)::int as count FROM reservations WHERE status = 'CANCELLED'`.then((result: any) => result[0]?.count || 0),
      
      // 총 매출 (확정된 예약의 총 금액) (raw SQL 사용)
      prisma.$queryRaw`SELECT COALESCE(SUM(total_amount), 0)::int as total FROM reservations WHERE status = 'CONFIRMED'`.then((result: any) => result[0]?.total || 0),
      
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
      totalRevenue: totalRevenue, // raw SQL에서 이미 숫자로 반환됨
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