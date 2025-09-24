import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken } from '@/lib/admin-auth'
import { put } from '@vercel/blob'

// 팝업용 이미지 업로드
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ ok: false, error: '인증이 필요합니다.' }, { status: 401 })
    }

    const mockRequest = new NextRequest('http://localhost', {
      headers: { authorization: `Bearer ${token}` }
    })
    const admin = await verifyAdminToken(mockRequest)
    if (!admin) {
      return NextResponse.json({ ok: false, error: '유효하지 않은 토큰입니다.' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('image') as File

    if (!file) {
      return NextResponse.json({ ok: false, error: '업로드할 이미지가 없습니다.' }, { status: 400 })
    }

    // 파일 타입 검증
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ ok: false, error: '이미지 파일만 업로드할 수 있습니다.' }, { status: 400 })
    }

    // 파일 크기 검증 (5MB 제한)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ ok: false, error: '파일 크기는 5MB를 초과할 수 없습니다.' }, { status: 400 })
    }

    // 파일명 생성 (타임스탬프 + 원본 파일명)
    const timestamp = Date.now()
    const fileName = `${timestamp}_${file.name}`
    const blobPath = `popups/${fileName}`

    // Vercel Blob에 파일 업로드
    const blob = await put(blobPath, file, {
      access: 'public',
    })

    return NextResponse.json({ 
      ok: true, 
      data: {
        url: blob.url,
        fileName: file.name,
        fileSize: file.size
      },
      message: '이미지가 업로드되었습니다.'
    })
  } catch (error) {
    console.error('Upload popup image error:', error)
    return NextResponse.json({ ok: false, error: '이미지 업로드에 실패했습니다.' }, { status: 500 })
  }
}
