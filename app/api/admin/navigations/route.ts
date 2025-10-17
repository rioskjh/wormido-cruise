import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { z } from 'zod'

// 동적 렌더링 강제
export const dynamic = 'force-dynamic'

// 네비게이션 생성/수정 스키마
const navigationSchema = z.object({
  title: z.string().min(1, '제목은 필수입니다'),
  url: z.string().optional(),
  type: z.enum(['CUSTOM', 'PRODUCTS', 'BOARD', 'CONTENT', 'EXTERNAL']),
  targetId: z.number().optional(),
  parentId: z.number().optional(),
  sortOrder: z.number().default(0),
  isActive: z.boolean().default(true),
  isNewWindow: z.boolean().default(false)
})

// GET: 모든 네비게이션 조회 (계층 구조)
export async function GET(request: NextRequest) {
  try {
    // 관리자 인증 확인
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        ok: false,
        error: '인증 토큰이 필요합니다.',
      }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const payload = verifyToken(token)
    
    if (!payload || (payload.role !== 'ADMIN' && payload.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({
        ok: false,
        error: '관리자 권한이 필요합니다.',
      }, { status: 403 })
    }

    const navigations = await prisma.navigation.findMany({
      include: {
        children: {
          orderBy: { sortOrder: 'asc' }
        }
      },
      orderBy: { sortOrder: 'asc' }
    })

    // 최상위 메뉴만 필터링
    const topLevelNavigations = navigations.filter((nav: any) => !nav.parentId)

    return NextResponse.json({
      ok: true,
      data: topLevelNavigations,
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Last-Modified': new Date().toUTCString(),
        'ETag': `"${Date.now()}"`
      }
    })
  } catch (error) {
    console.error('네비게이션 조회 오류:', error)
    return NextResponse.json({
      ok: false,
      error: '네비게이션 조회 중 오류가 발생했습니다.'
    }, { status: 500 })
  }
}

// POST: 새 네비게이션 생성
export async function POST(request: NextRequest) {
  try {
    // 관리자 인증 확인
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        ok: false,
        error: '인증 토큰이 필요합니다.',
      }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const payload = verifyToken(token)
    
    if (!payload || (payload.role !== 'ADMIN' && payload.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({
        ok: false,
        error: '관리자 권한이 필요합니다.',
      }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = navigationSchema.parse(body)

    // 최대 6개 메뉴 제한 확인
    if (!validatedData.parentId) {
      const topLevelCount = await prisma.navigation.count({
        where: { parentId: null }
      })
      if (topLevelCount >= 6) {
        return NextResponse.json({
          ok: false,
          error: '최상위 메뉴는 최대 6개까지 등록 가능합니다.'
        }, { status: 400 })
      }
    }

    // URL 생성 로직
    let finalUrl = validatedData.url
    if (validatedData.type === 'PRODUCTS') {
      finalUrl = '/products'
    } else if (validatedData.type === 'BOARD' && validatedData.targetId) {
      // 게시판 타입별 URL 매핑
      const boardUrlMap: { [key: number]: string } = {
        1: '/board/notice',    // 공지사항
        2: '/board/event',     // 이벤트
        3: '/board/review',    // 리뷰
        4: '/board/event',     // 이벤트 (수정)
        5: '/board/qna',       // Q&A
        6: '/board/faq',       // FAQ (수정)
        7: '/board/event-review' // 이벤트 리뷰
      }
      
      const boardUrl = boardUrlMap[validatedData.targetId]
      if (boardUrl) {
        finalUrl = boardUrl
      }
    } else if (validatedData.type === 'CONTENT' && validatedData.targetId) {
      const content = await prisma.content.findUnique({
        where: { id: validatedData.targetId }
      })
      if (content) {
        finalUrl = `/contents?slug=${content.slug}`
      }
    }

    const navigation = await prisma.navigation.create({
      data: {
        ...validatedData,
        url: finalUrl
      },
      include: {
        children: true
      }
    })

    return NextResponse.json({
      ok: true,
      data: navigation,
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Last-Modified': new Date().toUTCString(),
        'ETag': `"${Date.now()}"`
      }
    })
  } catch (error) {
    console.error('네비게이션 생성 오류:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        ok: false,
        error: error.errors[0].message
      }, { status: 400 })
    }
    return NextResponse.json({
      ok: false,
      error: '네비게이션 생성 중 오류가 발생했습니다.'
    }, { status: 500 })
  }
}
