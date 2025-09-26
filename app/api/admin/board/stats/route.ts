import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminToken } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // 관리자 인증 확인
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

    // 게시판별 통계 조회
    const [
      totalPosts,
      noticePosts,
      eventPosts,
      reviewPosts,
      faqPosts,
      qnaPosts
    ] = await Promise.all([
      // 전체 게시글 수
      prisma.post.count(),
      
      // 공지사항 수
      prisma.post.count({
        where: { type: 'NOTICE' }
      }),
      
      // 이벤트 수
      prisma.post.count({
        where: { type: 'EVENT' }
      }),
      
      // 리뷰 수
      prisma.post.count({
        where: { type: 'REVIEW' }
      }),
      
      // FAQ 수
      prisma.post.count({
        where: { type: 'FAQ' }
      }),
      
      // Q&A 수
      prisma.post.count({
        where: { type: 'QNA' }
      })
    ])

    const stats = {
      totalPosts,
      noticePosts,
      eventPosts,
      reviewPosts,
      faqPosts,
      qnaPosts
    }

    return NextResponse.json({
      ok: true,
      stats
    })

  } catch (error) {
    console.error('게시판 통계 조회 오류:', error)
    return NextResponse.json({
      ok: false,
      error: '게시판 통계 조회 중 오류가 발생했습니다.'
    }, { status: 500 })
  }
}
