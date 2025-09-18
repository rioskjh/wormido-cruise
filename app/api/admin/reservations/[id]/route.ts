import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export const runtime = 'nodejs'

// 관리자 예약 상태 변경 (PUT)
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
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json({
        ok: false,
        error: '관리자 권한이 필요합니다.',
      }, { status: 403 })
    }

    const reservationId = parseInt(params.id)
    if (isNaN(reservationId)) {
      return NextResponse.json({
        ok: false,
        error: '유효하지 않은 예약 ID입니다.',
      }, { status: 400 })
    }

    const body = await request.json()
    const { status, adminNote } = body

    // 유효한 상태인지 확인
    const validStatuses = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({
        ok: false,
        error: '유효하지 않은 상태입니다.',
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

    // 예약 상태 업데이트
    const updateData: any = {}
    
    if (status) {
      updateData.status = status
      
      // 상태별 특별 처리
      if (status === 'CANCELLED') {
        updateData.cancelledAt = new Date()
      } else if (status === 'COMPLETED') {
        updateData.completedAt = new Date()
      }
    }

    if (adminNote) {
      updateData.adminNote = adminNote
    }

    const updatedReservation = await prisma.reservation.update({
      where: { id: reservationId },
      data: updateData,
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
    })

    return NextResponse.json({
      ok: true,
      data: updatedReservation,
      message: '예약 상태가 성공적으로 변경되었습니다.',
    })

  } catch (error) {
    console.error('Admin reservation update error:', error)
    return NextResponse.json({
      ok: false,
      error: '예약 상태 변경 중 오류가 발생했습니다.',
    }, { status: 500 })
  }
}
