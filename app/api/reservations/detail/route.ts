import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderNumber = searchParams.get('orderNumber')

    if (!orderNumber) {
      return NextResponse.json({
        ok: false,
        error: '예약 번호가 필요합니다.',
      }, { status: 400 })
    }

    // 예약 정보 조회
    const reservation = await prisma.reservation.findUnique({
      where: { orderNumber },
      include: {
        product: {
          select: {
            name: true,
            description: true,
            category: {
              select: {
                name: true
              }
            }
          }
        },
        member: {
          select: {
            username: true,
            nickname: true
          }
        }
      }
    })

    if (!reservation) {
      return NextResponse.json({
        ok: false,
        error: '예약을 찾을 수 없습니다.',
      }, { status: 404 })
    }

    return NextResponse.json({
      ok: true,
      data: {
        reservation
      }
    })

  } catch (error) {
    console.error('Reservation detail fetch error:', error)
    
    return NextResponse.json({
      ok: false,
      error: '예약 정보를 불러오는 중 오류가 발생했습니다.',
    }, { status: 500 })
  }
}
