import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// 관리자 예약 목록 조회 (GET)
export async function GET(request: NextRequest) {
  try {
    // 관리자 인증 확인
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        ok: false,
        error: '인증 토큰이 필요합니다.',
      }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const payload = verifyToken(token)
    
    if (!payload) {
      return NextResponse.json({
        ok: false,
        error: '유효하지 않은 토큰입니다.',
      }, { status: 401 })
    }

    if (payload.role !== 'ADMIN' && payload.role !== 'SUPER_ADMIN') {
      return NextResponse.json({
        ok: false,
        error: '관리자 권한이 필요합니다.',
      }, { status: 403 })
    }

    const { searchParams } = request.nextUrl
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')

    const skip = (page - 1) * limit

    // 필터 조건 구성
    const where: any = {}
    if (status && status !== 'ALL') {
      where.paymentStatus = status
    }

    // 예약 목록 조회
    const [reservations, total] = await Promise.all([
      prisma.reservation.findMany({
        where,
        include: {
          product: {
            select: {
              id: true,
              name: true,
            }
          },
          member: {
            select: {
              id: true,
              username: true,
              email: true,
            }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.reservation.count({ where }),
    ])

    return NextResponse.json({
      ok: true,
      data: {
        reservations,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    })

  } catch (error) {
    console.error('Admin reservations fetch error:', error)
    return NextResponse.json({
      ok: false,
      error: '예약 목록을 불러오는 중 오류가 발생했습니다.',
    }, { status: 500 })
  }
}