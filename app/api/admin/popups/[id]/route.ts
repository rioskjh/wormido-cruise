import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminToken } from '@/lib/admin-auth'
import { z } from 'zod'

export const runtime = 'nodejs'

const popupUpdateSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요').optional(),
  isActive: z.boolean().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  width: z.number().optional().nullable(),
  height: z.number().optional().nullable(),
  backgroundColor: z.string().optional(),
  textColor: z.string().optional(),
  borderColor: z.string().optional(),
  borderRadius: z.number().optional(),
  zIndex: z.number().optional(),
  // 에디터 관련 필드
  contentHtml: z.string().optional(),
  // 쿠키 관련 필드
  showDontShowToday: z.boolean().optional(),
  cookieExpireHours: z.number().min(1).max(168).optional()
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

    const mockRequest = new NextRequest('http://localhost', {
      headers: { authorization: `Bearer ${token}` }
    })
    const admin = await verifyAdminToken(mockRequest)
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
    // content 필드는 빈 문자열로 설정 (에디터만 사용)
    updateData.content = ''
    
    if (validatedData.startDate && validatedData.startDate.trim() !== '') {
      updateData.startDate = new Date(validatedData.startDate)
    }
    if (validatedData.endDate && validatedData.endDate.trim() !== '') {
      updateData.endDate = new Date(validatedData.endDate)
    }
    
    // 에디터 관련 필드 처리
    if (validatedData.contentHtml !== undefined) {
      updateData.contentHtml = validatedData.contentHtml || null
    }
    
    // 쿠키 관련 필드 처리
    if (validatedData.showDontShowToday !== undefined) {
      updateData.showDontShowToday = validatedData.showDontShowToday
    }
    if (validatedData.cookieExpireHours !== undefined) {
      updateData.cookieExpireHours = validatedData.cookieExpireHours
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

    const mockRequest = new NextRequest('http://localhost', {
      headers: { authorization: `Bearer ${token}` }
    })
    const admin = await verifyAdminToken(mockRequest)
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
