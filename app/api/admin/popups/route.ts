import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminToken } from '@/lib/admin-auth'
import { z } from 'zod'

export const runtime = 'nodejs'

const popupSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요'),
  isActive: z.boolean(),
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

// 팝업 목록 조회
export async function GET(request: NextRequest) {
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

    const popups = await prisma.popup.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      ok: true,
      data: popups
    })

  } catch (error) {
    console.error('Popup list error:', error)
    return NextResponse.json({
      ok: false,
      error: '팝업 목록을 불러오는 중 오류가 발생했습니다.'
    }, { status: 500 })
  }
}

// 팝업 생성
export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const validatedData = popupSchema.parse(body)

    const popup = await prisma.popup.create({
      data: {
        ...validatedData,
        content: '', // content 필드는 빈 문자열로 설정 (에디터만 사용)
        startDate: validatedData.startDate ? new Date(validatedData.startDate) : new Date(),
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30일 후
        zIndex: validatedData.zIndex || 1000,
        // 에디터 관련 필드
        contentHtml: validatedData.contentHtml || null,
        // 쿠키 관련 필드
        showDontShowToday: validatedData.showDontShowToday || false,
        cookieExpireHours: validatedData.cookieExpireHours || 24
      }
    })

    return NextResponse.json({
      ok: true,
      data: popup
    })

  } catch (error) {
    console.error('Popup creation error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        ok: false,
        error: error.errors[0].message
      }, { status: 400 })
    }

    return NextResponse.json({
      ok: false,
      error: '팝업 생성 중 오류가 발생했습니다.'
    }, { status: 500 })
  }
}
