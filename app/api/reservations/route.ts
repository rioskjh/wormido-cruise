import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { getNoCacheHeaders } from '@/lib/cache-headers'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      productId,
      adults,
      children,
      infants,
      customerName,
      customerPhone,
      customerEmail,
      representativeName,
      representativePhone,
      representativeEmail,
      totalAmount,
      selectedOptions = {}
    } = body

    // 필수 필드 검증
    if (!productId || !customerName || !customerPhone || !customerEmail || !totalAmount) {
      return NextResponse.json({
        ok: false,
        error: '필수 정보가 누락되었습니다.',
      }, { status: 400 })
    }

    // 대표 탑승자 정보 검증
    if (!representativeName || !representativePhone || !representativeEmail) {
      return NextResponse.json({
        ok: false,
        error: '대표 탑승자 정보가 누락되었습니다.',
      }, { status: 400 })
    }

    // 인원 수 검증
    if (adults < 1) {
      return NextResponse.json({
        ok: false,
        error: '성인 인원은 최소 1명 이상이어야 합니다.',
      }, { status: 400 })
    }

    // 상품 존재 및 활성 상태 확인
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        options: {
          include: {
            values: true
          }
        }
      }
    })

    if (!product) {
      return NextResponse.json({
        ok: false,
        error: '상품을 찾을 수 없습니다.',
      }, { status: 404 })
    }

    if (!product.isActive) {
      return NextResponse.json({
        ok: false,
        error: '현재 판매하지 않는 상품입니다.',
      }, { status: 400 })
    }

    // 수용 가능 인원 확인
    const totalPersons = adults + children + infants
    if (product.currentBookings + totalPersons > (product.maxCapacity || 0)) {
      return NextResponse.json({
        ok: false,
        error: '예약 가능한 인원을 초과했습니다.',
      }, { status: 400 })
    }

    // 로그인된 사용자 확인 (선택사항 - 비회원도 예약 가능)
    let memberId = null
    const authHeader = request.headers.get('authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7)
        const payload = verifyToken(token)
        if (payload) {
          memberId = payload.id
        }
      } catch (error) {
        // 토큰이 유효하지 않아도 비회원으로 예약 진행
        console.log('Invalid token, proceeding as guest')
      }
    }

    // 예약 번호 생성 (YYYYMMDD + 랜덤 6자리)
    const today = new Date()
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '')
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase()
    const orderNumber = `WR${dateStr}${randomStr}`

    // 트랜잭션으로 예약 생성 및 상품 예약 수 증가
    const result = await prisma.$transaction(async (tx) => {
      // 예약 생성
      const reservation = await tx.reservation.create({
        data: {
          orderNumber,
          memberId: memberId || 1, // 기본 회원 ID (비회원 예약용)
          productId,
          customerName,
          customerPhone,
          customerEmail,
          representativeName,
          representativePhone,
          representativeEmail,
          adults,
          children,
          infants,
          totalAmount,
          status: 'CONFIRMED', // 테스트 모드이므로 바로 확정
          paymentStatus: 'COMPLETED', // 테스트 모드이므로 결제 완료
          paymentMethod: 'TEST_PAYMENT',
          paymentDate: new Date(),
          reservationDate: new Date(), // 현재 날짜로 설정
          reservationTime: '10:00' // 기본 시간 설정
        },
        include: {
          product: {
            select: {
              name: true
            }
          }
        }
      })

      // 상품의 현재 예약 수 증가
      await tx.product.update({
        where: { id: productId },
        data: {
          currentBookings: {
            increment: totalPersons
          }
        }
      })

      return reservation
    })

    return NextResponse.json({
      ok: true,
      data: {
        reservation: result
      },
      timestamp: new Date().toISOString()
    }, {
      headers: getNoCacheHeaders()
    })

  } catch (error) {
    console.error('Reservation creation error:', error)
    
    return NextResponse.json({
      ok: false,
      error: '예약 처리 중 오류가 발생했습니다.',
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // 로그인된 사용자의 예약 목록 조회 (로그인 필수)
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        ok: false,
        error: '로그인이 필요합니다.',
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

    const reservations = await prisma.reservation.findMany({
      where: {
        memberId: payload.id
      },
      include: {
        product: {
          select: {
            name: true,
            category: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      ok: true,
      data: {
        reservations
      },
      timestamp: new Date().toISOString()
    }, {
      headers: getNoCacheHeaders()
    })

  } catch (error) {
    console.error('Reservations fetch error:', error)
    
    return NextResponse.json({
      ok: false,
      error: '예약 목록을 불러오는 중 오류가 발생했습니다.',
    }, { status: 500 })
  }
}