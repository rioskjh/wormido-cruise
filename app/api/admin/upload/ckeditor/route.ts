import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken } from '@/lib/admin-auth'
import { writeFile, mkdir, chown } from 'fs/promises'
import path from 'path'

export const dynamic = 'force-dynamic'

// CKEditor 파일 업로드 (이미지, 일반 파일)
export async function POST(request: NextRequest) {
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

    const formData = await request.formData()
    const file = formData.get('upload') as File

    if (!file) {
      return NextResponse.json({ ok: false, error: '파일이 선택되지 않았습니다.' }, { status: 400 })
    }

    // 파일 크기 검증 (10MB 제한)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        ok: false, 
        error: '파일 크기는 10MB를 초과할 수 없습니다.' 
      }, { status: 400 })
    }

    // 파일 확장자 검증
    const allowedExtensions = [
      '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', // 이미지
      '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', // 문서
      '.txt', '.zip', '.rar', '.7z' // 기타
    ]
    
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!allowedExtensions.includes(fileExtension)) {
      return NextResponse.json({ 
        ok: false, 
        error: '허용되지 않는 파일 형식입니다.' 
      }, { status: 400 })
    }

    // 파일명 생성 (타임스탬프 + 랜덤코드 + 원본 파일명)
    const timestamp = Date.now()
    const randomCode = Math.random().toString(36).substring(2, 8)
    const fileName = `${timestamp}_${randomCode}_${file.name}`
    
    // 파일 타입에 따라 저장 경로 결정
    const isImage = file.type.startsWith('image/')
    const uploadSubDir = isImage ? 'ckeditor' : 'ckeditor/files'
    
    // 외부 업로드 디렉토리에 직접 저장 (빌드와 독립적)
    const uploadDir = `/home/wolmido/uploads/images/${uploadSubDir}`
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
      console.log('CKEditor 파일 소유자 변경 완료')
    } catch (chownError) {
      console.warn('CKEditor 소유자 변경 실패 (무시하고 계속 진행):', chownError)
    }

    // CKEditor 응답 형식에 맞게 반환 (업로드된 파일 경로 사용)
    const fileUrl = isImage ? `/images/uploaded/${uploadSubDir}/${fileName}` : `/uploads/contents/${uploadSubDir}/${fileName}`
    
    return NextResponse.json({
      uploaded: true,
      url: fileUrl,
      fileName: file.name,
      size: file.size
    })

  } catch (error) {
    console.error('CKEditor 파일 업로드 오류:', error)
    return NextResponse.json({
      uploaded: false,
      error: {
        message: '파일 업로드 중 오류가 발생했습니다.'
      }
    }, { status: 500 })
  }
}
