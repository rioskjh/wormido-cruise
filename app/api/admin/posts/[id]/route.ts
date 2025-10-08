import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminToken } from '@/lib/admin-auth'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const updatePostSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요').optional(),
  contentHtml: z.string().min(1, '내용을 입력해주세요').optional(),
  isNotice: z.boolean().optional(),
  isSecret: z.boolean().optional(),
  authorName: z.string().optional(),
  qnaPasswordHash: z.string().optional(),
})

// GET: 특정 게시글 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const postId = parseInt(params.id)
    if (isNaN(postId)) {
      return NextResponse.json({ ok: false, error: '유효하지 않은 게시글 ID입니다.' }, { status: 400 })
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        members: {
          select: {
            id: true,
            username: true,
          }
        },
        files: true
      }
    })

    if (!post) {
      return NextResponse.json({ ok: false, error: '게시글을 찾을 수 없습니다.' }, { status: 404 })
    }

    return NextResponse.json({
      ok: true,
      post
    })

  } catch (error) {
    console.error('게시글 조회 오류:', error)
    return NextResponse.json({
      ok: false,
      error: '게시글 조회 중 오류가 발생했습니다.'
    }, { status: 500 })
  }
}

// PATCH: 게시글 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const postId = parseInt(params.id)
    if (isNaN(postId)) {
      return NextResponse.json({ ok: false, error: '유효하지 않은 게시글 ID입니다.' }, { status: 400 })
    }

    const body = await request.json()
    const validatedData = updatePostSchema.parse(body)

    // 기존 게시글 확인
    const existingPost = await prisma.post.findUnique({
      where: { id: postId }
    })

    if (!existingPost) {
      return NextResponse.json({ ok: false, error: '게시글을 찾을 수 없습니다.' }, { status: 404 })
    }

    // 업데이트 데이터 준비
    const updateData: any = { ...validatedData }

    // contentHtml이 변경된 경우 contentText도 업데이트
    if (validatedData.contentHtml) {
      updateData.contentText = validatedData.contentHtml.replace(/<[^>]*>/g, '').trim()
    }

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: updateData,
      include: {
        members: {
          select: {
            id: true,
            username: true,
          }
        },
        files: true
      }
    })

    return NextResponse.json({
      ok: true,
      post: updatedPost
    })

  } catch (error) {
    console.error('게시글 수정 오류:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        ok: false,
        error: error.errors[0].message
      }, { status: 400 })
    }

    return NextResponse.json({
      ok: false,
      error: '게시글 수정 중 오류가 발생했습니다.'
    }, { status: 500 })
  }
}

// DELETE: 게시글 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const postId = parseInt(params.id)
    if (isNaN(postId)) {
      return NextResponse.json({ ok: false, error: '유효하지 않은 게시글 ID입니다.' }, { status: 400 })
    }

    // 기존 게시글 확인
    const existingPost = await prisma.post.findUnique({
      where: { id: postId }
    })

    if (!existingPost) {
      return NextResponse.json({ ok: false, error: '게시글을 찾을 수 없습니다.' }, { status: 404 })
    }

    // 게시글 삭제 (연관된 파일들도 CASCADE로 삭제됨)
    await prisma.post.delete({
      where: { id: postId }
    })

    return NextResponse.json({
      ok: true,
      message: '게시글이 삭제되었습니다.'
    })

  } catch (error) {
    console.error('게시글 삭제 오류:', error)
    return NextResponse.json({
      ok: false,
      error: '게시글 삭제 중 오류가 발생했습니다.'
    }, { status: 500 })
  }
}
