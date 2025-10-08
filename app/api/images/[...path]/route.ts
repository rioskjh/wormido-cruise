import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'
import { existsSync } from 'fs'

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const imagePath = params.path.join('/')
    
    // 프로덕션 환경에서는 .next/standalone/public 경로 사용
    const isProduction = process.env.NODE_ENV === 'production'
    const publicPath = isProduction ? '.next/standalone/public' : 'public'
    const fullPath = path.join(process.cwd(), publicPath, 'images', imagePath)
    
    // 보안 검사: 경로가 public/images 디렉토리 내에 있는지 확인
    const publicImagesPath = path.join(process.cwd(), publicPath, 'images')
    const resolvedPath = path.resolve(fullPath)
    const resolvedPublicPath = path.resolve(publicImagesPath)
    
    if (!resolvedPath.startsWith(resolvedPublicPath)) {
      return new NextResponse('Forbidden', { status: 403 })
    }
    
    // 파일 존재 확인
    if (!existsSync(fullPath)) {
      return new NextResponse('Not Found', { status: 404 })
    }
    
    // 파일 읽기
    const fileBuffer = await readFile(fullPath)
    
    // MIME 타입 결정
    const ext = path.extname(fullPath).toLowerCase()
    let contentType = 'application/octet-stream'
    
    switch (ext) {
      case '.png':
        contentType = 'image/png'
        break
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg'
        break
      case '.gif':
        contentType = 'image/gif'
        break
      case '.webp':
        contentType = 'image/webp'
        break
      case '.svg':
        contentType = 'image/svg+xml'
        break
    }
    
    return new NextResponse(new Uint8Array(fileBuffer), {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('Image serving error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
