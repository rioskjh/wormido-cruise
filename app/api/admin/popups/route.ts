import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminToken } from '@/lib/admin-auth'
import { z } from 'zod'

export const runtime = 'nodejs'

const popupSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요'),
  content: z.string().min(1, '내용을 입력해주세요'),
  type: z.enum(['INFO', 'WARNING', 'SUCCESS', 'ERROR', 'PROMOTION', 'NOTICE']),
  position: z.enum(['TOP_LEFT', 'TOP_CENTER', 'TOP_RIGHT', 'CENTER_LEFT', 'CENTER', 'CENTER_RIGHT', 'BOTTOM_LEFT', 'BOTTOM_CENTER', 'BOTTOM_RIGHT']),
  size: z.enum(['SMALL', 'MEDIUM', 'LARGE', 'CUSTOM']),
  isActive: z.boolean(),
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

// 팝업 목록 조회
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ ok: false, error: '인증 토큰이 필요합니다.' }, { status: 401 })
    }

    const admin = await verifyAdminToken(token)
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

    const admin = await verifyAdminToken(token)
    if (!admin) {
      return NextResponse.json({ ok: false, error: '유효하지 않은 토큰입니다.' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = popupSchema.parse(body)

    const popup = await prisma.popup.create({
      data: {
        ...validatedData,
        startDate: validatedData.startDate ? new Date(validatedData.startDate) : null,
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
        zIndex: validatedData.zIndex || 1000
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
