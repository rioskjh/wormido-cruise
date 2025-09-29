import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminToken } from '@/lib/auth'

// 특정 컨텐츠 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 관리자 인증 확인
    const authResult = await verifyAdminToken(request)
    if (!authResult.ok) {
      return NextResponse.json({
        ok: false,
        error: authResult.error,
      }, { status: authResult.error?.includes('토큰이 필요') ? 401 : 403 })
    }

    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({
        ok: false,
        error: '유효하지 않은 ID입니다.',
      }, { status: 400 })
    }

    const content = await prisma.content.findUnique({
      where: { id }
    })

    if (!content) {
      return NextResponse.json({
        ok: false,
        error: '컨텐츠를 찾을 수 없습니다.',
      }, { status: 404 })
    }

    return NextResponse.json({
      ok: true,
      data: content
    })
  } catch (error) {
    console.error('Content fetch error:', error)
    return NextResponse.json({
      ok: false,
      error: '컨텐츠를 불러오는 중 오류가 발생했습니다.',
    }, { status: 500 })
  }
}

// 컨텐츠 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 관리자 인증 확인
    const authResult = await verifyAdminToken(request)
    if (!authResult.ok) {
      return NextResponse.json({
        ok: false,
        error: authResult.error,
      }, { status: authResult.error?.includes('토큰이 필요') ? 401 : 403 })
    }

    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({
        ok: false,
        error: '유효하지 않은 ID입니다.',
      }, { status: 400 })
    }

    const body = await request.json()
    const { title, slug, content, description, keywords, isActive, isPublished } = body

    // 필수 필드 검증
    if (!title || !slug || !content) {
      return NextResponse.json({
        ok: false,
        error: '제목, 슬러그, 내용은 필수입니다.',
      }, { status: 400 })
    }

    // 기존 컨텐츠 확인
    const existingContent = await prisma.content.findUnique({
      where: { id }
    })

    if (!existingContent) {
      return NextResponse.json({
        ok: false,
        error: '컨텐츠를 찾을 수 없습니다.',
      }, { status: 404 })
    }

    // 슬러그 중복 검사 (자기 자신 제외)
    const slugConflict = await prisma.content.findFirst({
      where: {
        slug,
        id: { not: id }
      }
    })

    if (slugConflict) {
      return NextResponse.json({
        ok: false,
        error: '이미 사용 중인 슬러그입니다.',
      }, { status: 400 })
    }

    // HTML에서 텍스트 추출
    const contentText = content.replace(/<[^>]*>/g, '').trim()

    // 발행 상태가 변경된 경우 publishedAt 업데이트
    let publishedAt = existingContent.publishedAt
    if (isPublished && !existingContent.isPublished) {
      publishedAt = new Date()
    } else if (!isPublished && existingContent.isPublished) {
      publishedAt = null
    }

    const updatedContent = await prisma.content.update({
      where: { id },
      data: {
        title,
        slug,
        content,
        contentText,
        description,
        keywords,
        isActive: isActive ?? true,
        isPublished: isPublished ?? false,
        publishedAt
      }
    })

    return NextResponse.json({
      ok: true,
      data: updatedContent
    })
  } catch (error) {
    console.error('Content update error:', error)
    return NextResponse.json({
      ok: false,
      error: '컨텐츠 수정 중 오류가 발생했습니다.',
    }, { status: 500 })
  }
}

// 컨텐츠 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 관리자 인증 확인
    const authResult = await verifyAdminToken(request)
    if (!authResult.ok) {
      return NextResponse.json({
        ok: false,
        error: authResult.error,
      }, { status: authResult.error?.includes('토큰이 필요') ? 401 : 403 })
    }

    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({
        ok: false,
        error: '유효하지 않은 ID입니다.',
      }, { status: 400 })
    }

    // 기존 컨텐츠 확인
    const existingContent = await prisma.content.findUnique({
      where: { id }
    })

    if (!existingContent) {
      return NextResponse.json({
        ok: false,
        error: '컨텐츠를 찾을 수 없습니다.',
      }, { status: 404 })
    }

    await prisma.content.delete({
      where: { id }
    })

    return NextResponse.json({
      ok: true,
      message: '컨텐츠가 삭제되었습니다.'
    })
  } catch (error) {
    console.error('Content deletion error:', error)
    return NextResponse.json({
      ok: false,
      error: '컨텐츠 삭제 중 오류가 발생했습니다.',
    }, { status: 500 })
  }
}
