import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminToken } from '@/lib/admin-auth'
import { readFile } from 'fs/promises'
import path from 'path'

export const dynamic = 'force-dynamic'

// GET: 첨부파일 다운로드
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string, fileId: string } }
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
    const fileId = parseInt(params.fileId)
    
    if (isNaN(postId) || isNaN(fileId)) {
      return NextResponse.json({ ok: false, error: '유효하지 않은 ID입니다.' }, { status: 400 })
    }

    // 첨부파일 조회
    const postFile = await prisma.postFile.findFirst({
      where: { 
        id: fileId,
        postId: postId
      }
    })

    if (!postFile) {
      return NextResponse.json({ ok: false, error: '첨부파일을 찾을 수 없습니다.' }, { status: 404 })
    }

    // 파일 경로 구성
    const filePath = path.join('/home/wolmido/public_html/public', postFile.storagePath)
    
    try {
      // 파일 읽기
      const fileBuffer = await readFile(filePath)
      
      // 파일 확장자에 따른 MIME 타입 결정
      const fileExtension = path.extname(postFile.filename).toLowerCase()
      let mimeType = 'application/octet-stream'
      
      switch (fileExtension) {
        case '.pdf':
          mimeType = 'application/pdf'
          break
        case '.doc':
          mimeType = 'application/msword'
          break
        case '.docx':
          mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          break
        case '.xls':
          mimeType = 'application/vnd.ms-excel'
          break
        case '.xlsx':
          mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          break
        case '.ppt':
          mimeType = 'application/vnd.ms-powerpoint'
          break
        case '.pptx':
          mimeType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
          break
        case '.txt':
          mimeType = 'text/plain'
          break
        case '.zip':
          mimeType = 'application/zip'
          break
        case '.rar':
          mimeType = 'application/x-rar-compressed'
          break
        case '.7z':
          mimeType = 'application/x-7z-compressed'
          break
        case '.jpg':
        case '.jpeg':
          mimeType = 'image/jpeg'
          break
        case '.png':
          mimeType = 'image/png'
          break
        case '.gif':
          mimeType = 'image/gif'
          break
        case '.webp':
          mimeType = 'image/webp'
          break
        case '.svg':
          mimeType = 'image/svg+xml'
          break
      }

      // 파일 다운로드 응답
      return new NextResponse(new Uint8Array(fileBuffer), {
        status: 200,
        headers: {
          'Content-Type': mimeType,
          'Content-Disposition': `attachment; filename="${encodeURIComponent(postFile.filename)}"`,
          'Content-Length': fileBuffer.length.toString(),
        },
      })

    } catch (fileError) {
      console.error('파일 읽기 오류:', fileError)
      return NextResponse.json({ 
        ok: false, 
        error: '파일을 찾을 수 없습니다.' 
      }, { status: 404 })
    }

  } catch (error) {
    console.error('첨부파일 다운로드 오류:', error)
    return NextResponse.json({
      ok: false,
      error: '첨부파일 다운로드 중 오류가 발생했습니다.'
    }, { status: 500 })
  }
}
