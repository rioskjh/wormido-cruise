import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminToken } from '@/lib/admin-auth'
import { del } from '@vercel/blob'

export const dynamic = 'force-dynamic'

// DELETE: 첨부파일 삭제
export async function DELETE(
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

    // Vercel Blob에서 파일 삭제
    try {
      await del(postFile.storagePath)
    } catch (error) {
      console.error('Blob 파일 삭제 오류:', error)
      // Blob 삭제 실패해도 DB에서 삭제는 진행
    }

    // 데이터베이스에서 파일 정보 삭제
    await prisma.postFile.delete({
      where: { id: fileId }
    })

    return NextResponse.json({
      ok: true,
      message: '첨부파일이 삭제되었습니다.'
    })

  } catch (error) {
    console.error('첨부파일 삭제 오류:', error)
    return NextResponse.json({
      ok: false,
      error: '첨부파일 삭제 중 오류가 발생했습니다.'
    }, { status: 500 })
  }
}
