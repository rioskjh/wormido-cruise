import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export const runtime = 'nodejs'

// 관리자 예약 목록 조회 (GET)
export async function GET(request: NextRequest) {
  try {
    // 인증 확인
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({
        ok: false,
        error: '인증이 필요합니다.',
      }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json({
        ok: false,
        error: '관리자 권한이 필요합니다.',
      }, { status: 403 })
    }

    const { searchParams } = request.nextUrl
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const productId = searchParams.get('productId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const skip = (page - 1) * limit

    // 필터 조건 구성
    const where: any = {}

    if (status) {
      where.status = status
    }

    if (productId) {
      where.productId = parseInt(productId)
    }

    if (startDate && endDate) {
      where.reservationDate = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    }

    // 예약 목록 조회
    const [reservations, total] = await Promise.all([
      prisma.reservation.findMany({
        where,
        include: {
          product: {
            include: {
              category: true,
            },
          },
          member: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
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
