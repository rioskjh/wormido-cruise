import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminToken } from '@/lib/admin-auth'
import { z } from 'zod'

export const runtime = 'nodejs'

const popupUpdateSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요').optional(),
  content: z.string().min(1, '내용을 입력해주세요').optional(),
  type: z.enum(['INFO', 'WARNING', 'SUCCESS', 'ERROR', 'PROMOTION', 'NOTICE']).optional(),
  position: z.enum(['TOP_LEFT', 'TOP_CENTER', 'TOP_RIGHT', 'CENTER_LEFT', 'CENTER', 'CENTER_RIGHT', 'BOTTOM_LEFT', 'BOTTOM_CENTER', 'BOTTOM_RIGHT']).optional(),
  size: z.enum(['SMALL', 'MEDIUM', 'LARGE', 'CUSTOM']).optional(),
  isActive: z.boolean().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  maxShow: z.number().optional(),
  targetPages: z.string().optional(),
  excludePages: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  backgroundColor: z.string().optional(),
  textColor: z.string().optional(),
  borderColor: z.string().optional(),
  borderRadius: z.number().optional(),
  zIndex: z.number().optional()
})

// 팝업 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ ok: false, error: '인증 토큰이 필요합니다.' }, { status: 401 })
    }

    const admin = await verifyAdminToken(token)
    if (!admin) {
      return NextResponse.json({ ok: false, error: '유효하지 않은 토큰입니다.' }, { status: 401 })
    }

    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ ok: false, error: '유효하지 않은 팝업 ID입니다.' }, { status: 400 })
    }

    const body = await request.json()
    const validatedData = popupUpdateSchema.parse(body)

    // 기존 팝업 확인
    const existingPopup = await prisma.popup.findUnique({
      where: { id }
    })

    if (!existingPopup) {
      return NextResponse.json({ ok: false, error: '팝업을 찾을 수 없습니다.' }, { status: 404 })
    }

    const updateData: any = { ...validatedData }
    if (validatedData.startDate) {
      updateData.startDate = new Date(validatedData.startDate)
    }
    if (validatedData.endDate) {
      updateData.endDate = new Date(validatedData.endDate)
    }

    const popup = await prisma.popup.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({
      ok: true,
      data: popup
    })

  } catch (error) {
    console.error('Popup update error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        ok: false,
        error: error.errors[0].message
      }, { status: 400 })
    }

    return NextResponse.json({
      ok: false,
      error: '팝업 수정 중 오류가 발생했습니다.'
    }, { status: 500 })
  }
}

// 팝업 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ ok: false, error: '인증 토큰이 필요합니다.' }, { status: 401 })
    }

    const admin = await verifyAdminToken(token)
    if (!admin) {
      return NextResponse.json({ ok: false, error: '유효하지 않은 토큰입니다.' }, { status: 401 })
    }

    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ ok: false, error: '유효하지 않은 팝업 ID입니다.' }, { status: 400 })
    }

    // 기존 팝업 확인
    const existingPopup = await prisma.popup.findUnique({
      where: { id }
    })

    if (!existingPopup) {
      return NextResponse.json({ ok: false, error: '팝업을 찾을 수 없습니다.' }, { status: 404 })
    }

    await prisma.popup.delete({
      where: { id }
    })

    return NextResponse.json({
      ok: true,
      message: '팝업이 삭제되었습니다.'
    })

  } catch (error) {
    console.error('Popup delete error:', error)
    return NextResponse.json({
      ok: false,
      error: '팝업 삭제 중 오류가 발생했습니다.'
    }, { status: 500 })
  }
}
