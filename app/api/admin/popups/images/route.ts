import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken } from '@/lib/admin-auth'
import { writeFile, mkdir, chown } from 'fs/promises'
import path from 'path'

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

    // 파일명 생성 (타임스탬프 + 랜덤코드 + 원본 파일명)
    const timestamp = Date.now()
    const randomCode = Math.random().toString(36).substring(2, 8)
    const fileName = `${timestamp}_${randomCode}_${file.name}`
    
    // 외부 업로드 디렉토리에 직접 저장 (빌드와 독립적)
    const uploadDir = '/home/wolmido/uploads/images/popup'
    const filePath = path.join(uploadDir, fileName)
    
    // 디렉토리가 없으면 생성
    await mkdir(uploadDir, { recursive: true })
    
    // 파일을 외부 디렉토리에 저장
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)
    
    // 소유자를 www-data로 변경 (웹서버 권한)
    try {
      await chown(filePath, 33, 33) // www-data UID:GID
      console.log('팝업 이미지 소유자 변경 완료')
    } catch (chownError) {
      console.warn('팝업 이미지 소유자 변경 실패 (무시하고 계속 진행):', chownError)
    }

    return NextResponse.json({ 
      ok: true, 
      data: {
        url: `/images/uploaded/popup/${fileName}`,
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
