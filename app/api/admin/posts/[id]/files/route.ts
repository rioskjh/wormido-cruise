import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminToken } from '@/lib/admin-auth'
import { put } from '@vercel/blob'

export const dynamic = 'force-dynamic'

// POST: 게시글에 첨부파일 업로드
export async function POST(
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

    // 게시글 존재 확인
    const post = await prisma.post.findUnique({
      where: { id: postId }
    })

    if (!post) {
      return NextResponse.json({ ok: false, error: '게시글을 찾을 수 없습니다.' }, { status: 404 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ ok: false, error: '파일이 선택되지 않았습니다.' }, { status: 400 })
    }

    // 파일 크기 검증 (5MB 제한)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        ok: false, 
        error: '파일 크기는 5MB를 초과할 수 없습니다.' 
      }, { status: 400 })
    }

    // 파일 확장자 검증
    const allowedExtensions = [
      '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
      '.txt', '.zip', '.rar', '.7z', '.jpg', '.jpeg', '.png', '.gif'
    ]
    
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!allowedExtensions.includes(fileExtension)) {
      return NextResponse.json({ 
        ok: false, 
        error: '허용되지 않는 파일 형식입니다.' 
      }, { status: 400 })
    }

    // Vercel Blob에 파일 업로드
    const blob = await put(`posts/${postId}/${file.name}`, file, {
      access: 'public',
    })

    // 데이터베이스에 파일 정보 저장
    const postFile = await prisma.postFile.create({
      data: {
        postId: postId,
        storagePath: blob.url,
        filename: file.name,
        size: file.size
      }
    })

    return NextResponse.json({
      ok: true,
      file: {
        id: postFile.id,
        filename: postFile.filename,
        size: postFile.size,
        url: postFile.storagePath
      }
    })

  } catch (error) {
    console.error('파일 업로드 오류:', error)
    return NextResponse.json({
      ok: false,
      error: '파일 업로드 중 오류가 발생했습니다.'
    }, { status: 500 })
  }
}

// GET: 게시글의 첨부파일 목록 조회
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

    const files = await prisma.postFile.findMany({
      where: { postId: postId },
      orderBy: { createdAt: 'asc' }
    })

    return NextResponse.json({
      ok: true,
      files: files.map(file => ({
        id: file.id,
        filename: file.filename,
        size: file.size,
        url: file.storagePath,
        createdAt: file.createdAt
      }))
    })

  } catch (error) {
    console.error('첨부파일 목록 조회 오류:', error)
    return NextResponse.json({
      ok: false,
      error: '첨부파일 목록 조회 중 오류가 발생했습니다.'
    }, { status: 500 })
  }
}
