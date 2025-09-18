import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export const runtime = 'nodejs'

// 예약 목록 조회 (GET)
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
    if (!payload) {
      return NextResponse.json({
        ok: false,
        error: '유효하지 않은 토큰입니다.',
      }, { status: 401 })
    }

    const { searchParams } = request.nextUrl
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')

    const skip = (page - 1) * limit

    // 필터 조건 구성
    const where: any = {
      memberId: payload.id,
    }

    if (status) {
      where.status = status
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
    console.error('Reservations fetch error:', error)
    return NextResponse.json({
      ok: false,
      error: '예약 목록을 불러오는 중 오류가 발생했습니다.',
    }, { status: 500 })
  }
}

// 예약 생성 (POST)
export async function POST(request: NextRequest) {
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
    if (!payload) {
      return NextResponse.json({
        ok: false,
        error: '유효하지 않은 토큰입니다.',
      }, { status: 401 })
    }

    const body = await request.json()
    const {
      productId,
      customerName,
      customerPhone,
      customerEmail,
      reservationDate,
      adultCount,
      childCount,
      infantCount,
      totalAmount,
      paymentMethod,
      specialRequests,
    } = body

    // 필수 필드 검증
    if (!productId || !customerName || !customerPhone || !customerEmail || !reservationDate) {
      return NextResponse.json({
        ok: false,
        error: '필수 정보가 누락되었습니다.',
      }, { status: 400 })
    }

    // 상품 존재 확인
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        personTypePrices: true,
      },
    })

    if (!product || !product.isActive) {
      return NextResponse.json({
        ok: false,
        error: '존재하지 않는 상품입니다.',
      }, { status: 404 })
    }

    // 예약 번호 생성 (YYYYMMDD-XXXXXX 형식)
    const today = new Date()
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '')
    const randomNum = Math.floor(Math.random() * 1000000).toString().padStart(6, '0')
    const orderNumber = `${dateStr}-${randomNum}`

    // 예약 생성
    const reservation = await prisma.reservation.create({
      data: {
        orderNumber,
        productId,
        memberId: payload.id,
        customerName,
        customerPhone,
        customerEmail,
        reservationDate: new Date(reservationDate),
        adults: adultCount || 0,
        children: childCount || 0,
        infants: infantCount || 0,
        totalAmount: totalAmount || 0,
        paymentMethod: paymentMethod || 'CARD',
        status: 'PENDING',
      },
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
    })

    return NextResponse.json({
      ok: true,
      data: reservation,
      message: '예약이 성공적으로 생성되었습니다.',
    })

  } catch (error) {
    console.error('Reservation creation error:', error)
    return NextResponse.json({
      ok: false,
      error: '예약 생성 중 오류가 발생했습니다.',
    }, { status: 500 })
  }
}
