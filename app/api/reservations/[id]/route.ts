import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export const runtime = 'nodejs'

// 특정 예약 조회 (GET)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const reservationId = parseInt(params.id)
    if (isNaN(reservationId)) {
      return NextResponse.json({
        ok: false,
        error: '유효하지 않은 예약 ID입니다.',
      }, { status: 400 })
    }

    // 예약 조회
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        product: {
          include: {
            category: true,
            personTypePrices: true,
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
    })

    if (!reservation) {
      return NextResponse.json({
        ok: false,
        error: '예약을 찾을 수 없습니다.',
      }, { status: 404 })
    }

    // 본인 예약인지 확인 (관리자가 아닌 경우)
    if (payload.role !== 'ADMIN' && reservation.memberId !== payload.userId) {
      return NextResponse.json({
        ok: false,
        error: '접근 권한이 없습니다.',
      }, { status: 403 })
    }

    return NextResponse.json({
      ok: true,
      data: reservation,
    })

  } catch (error) {
    console.error('Reservation fetch error:', error)
    return NextResponse.json({
      ok: false,
      error: '예약 정보를 불러오는 중 오류가 발생했습니다.',
    }, { status: 500 })
  }
}

// 예약 수정 (PUT)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const reservationId = parseInt(params.id)
    if (isNaN(reservationId)) {
      return NextResponse.json({
        ok: false,
        error: '유효하지 않은 예약 ID입니다.',
      }, { status: 400 })
    }

    const body = await request.json()
    const {
      customerName,
      customerPhone,
      customerEmail,
      reservationDate,
      adultCount,
      childCount,
      infantCount,
      specialRequests,
    } = body

    // 예약 존재 확인
    const existingReservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
    })

    if (!existingReservation) {
      return NextResponse.json({
        ok: false,
        error: '예약을 찾을 수 없습니다.',
      }, { status: 404 })
    }

    // 본인 예약인지 확인 (관리자가 아닌 경우)
    if (payload.role !== 'ADMIN' && existingReservation.memberId !== payload.userId) {
      return NextResponse.json({
        ok: false,
        error: '접근 권한이 없습니다.',
      }, { status: 403 })
    }

    // 예약 수정
    const updatedReservation = await prisma.reservation.update({
      where: { id: reservationId },
      data: {
        ...(customerName && { customerName }),
        ...(customerPhone && { customerPhone }),
        ...(customerEmail && { customerEmail }),
        ...(reservationDate && { reservationDate: new Date(reservationDate) }),
        ...(adultCount !== undefined && { adultCount }),
        ...(childCount !== undefined && { childCount }),
        ...(infantCount !== undefined && { infantCount }),
        ...(specialRequests !== undefined && { specialRequests }),
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
      data: updatedReservation,
      message: '예약이 성공적으로 수정되었습니다.',
    })

  } catch (error) {
    console.error('Reservation update error:', error)
    return NextResponse.json({
      ok: false,
      error: '예약 수정 중 오류가 발생했습니다.',
    }, { status: 500 })
  }
}

// 예약 취소 (DELETE)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const reservationId = parseInt(params.id)
    if (isNaN(reservationId)) {
      return NextResponse.json({
        ok: false,
        error: '유효하지 않은 예약 ID입니다.',
      }, { status: 400 })
    }

    // 예약 존재 확인
    const existingReservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
    })

    if (!existingReservation) {
      return NextResponse.json({
        ok: false,
        error: '예약을 찾을 수 없습니다.',
      }, { status: 404 })
    }

    // 본인 예약인지 확인 (관리자가 아닌 경우)
    if (payload.role !== 'ADMIN' && existingReservation.memberId !== payload.userId) {
      return NextResponse.json({
        ok: false,
        error: '접근 권한이 없습니다.',
      }, { status: 403 })
    }

    // 예약 취소 (상태만 변경, 실제 삭제하지 않음)
    const cancelledReservation = await prisma.reservation.update({
      where: { id: reservationId },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
      },
    })

    return NextResponse.json({
      ok: true,
      data: cancelledReservation,
      message: '예약이 성공적으로 취소되었습니다.',
    })

  } catch (error) {
    console.error('Reservation cancellation error:', error)
    return NextResponse.json({
      ok: false,
      error: '예약 취소 중 오류가 발생했습니다.',
    }, { status: 500 })
  }
}
