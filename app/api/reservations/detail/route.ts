import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderNumber = searchParams.get('orderNumber')
    const customerName = searchParams.get('customerName')

    if (!orderNumber || !customerName) {
      return NextResponse.json({
        ok: false,
        error: '예약번호와 예약자명을 모두 입력해주세요.',
      }, { status: 400 })
    }

    const reservation = await prisma.reservation.findFirst({
      where: {
        orderNumber,
        customerName
      },
      include: {
        product: true,
        member: true
      }
    })

    if (!reservation) {
      return NextResponse.json({
        ok: false,
        error: '예약 정보를 찾을 수 없습니다.',
      }, { status: 404 })
    }

    return NextResponse.json({
      ok: true,
      data: {
        reservation: {
          id: reservation.id,
          orderNumber: reservation.orderNumber,
          productName: reservation.product.name,
          reservationDate: reservation.reservationDate,
          reservationTime: reservation.reservationTime,
          adults: reservation.adults,
          children: reservation.children,
          infants: reservation.infants,
          totalAmount: reservation.totalAmount,
          status: reservation.status,
          paymentStatus: reservation.paymentStatus,
          customerName: reservation.customerName,
          customerPhone: reservation.customerPhone,
          customerEmail: reservation.customerEmail,
          representativeName: reservation.representativeName,
          representativePhone: reservation.representativePhone,
          representativeEmail: reservation.representativeEmail,
          createdAt: reservation.createdAt,
          updatedAt: reservation.updatedAt
        }
      }
    })

  } catch (error) {
    console.error('예약 조회 오류:', error)
    return NextResponse.json({
      ok: false,
      error: '서버 오류가 발생했습니다.',
    }, { status: 500 })
  }
}