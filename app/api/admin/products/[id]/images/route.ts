import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAccessToken } from '@/lib/auth'
import { writeFile, mkdir, chown } from 'fs/promises'
import path from 'path'

// 상품 이미지 목록 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ ok: false, error: '인증이 필요합니다.' }, { status: 401 })
    }

    const payload = await verifyAccessToken(token)
    if (!payload) {
      return NextResponse.json({ ok: false, error: '유효하지 않은 토큰입니다.' }, { status: 401 })
    }

    const productId = parseInt(params.id)
    if (isNaN(productId)) {
      return NextResponse.json({ ok: false, error: '유효하지 않은 상품 ID입니다.' }, { status: 400 })
    }

    const images = await prisma.productImage.findMany({
      where: {
        productId: productId,
        isActive: true
      },
      orderBy: {
        sortOrder: 'asc'
      }
    })

    return NextResponse.json({ ok: true, data: images })
  } catch (error) {
    console.error('Get product images error:', error)
    return NextResponse.json({ ok: false, error: '이미지 목록을 가져오는데 실패했습니다.' }, { status: 500 })
  }
}

// 상품 이미지 업로드 (여러 개)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('=== 이미지 업로드 API 호출됨 ===')
    console.log('Product ID:', params.id)
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      console.log('토큰 없음')
      return NextResponse.json({ ok: false, error: '인증이 필요합니다.' }, { status: 401 })
    }

    const payload = await verifyAccessToken(token)
    if (!payload) {
      return NextResponse.json({ ok: false, error: '유효하지 않은 토큰입니다.' }, { status: 401 })
    }

    const productId = parseInt(params.id)
    if (isNaN(productId)) {
      return NextResponse.json({ ok: false, error: '유효하지 않은 상품 ID입니다.' }, { status: 400 })
    }

    // 상품 존재 확인
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json({ ok: false, error: '상품을 찾을 수 없습니다.' }, { status: 404 })
    }

    const formData = await request.formData()
    const files = formData.getAll('images') as File[]
    
    console.log('업로드할 파일 개수:', files.length)
    console.log('파일명들:', files.map(f => f.name))

    if (files.length === 0) {
      console.log('업로드할 이미지가 없음')
      return NextResponse.json({ ok: false, error: '업로드할 이미지가 없습니다.' }, { status: 400 })
    }

    if (files.length > 5) {
      return NextResponse.json({ ok: false, error: '최대 5개의 이미지만 업로드할 수 있습니다.' }, { status: 400 })
    }

    // 현재 이미지 개수 확인
    const currentImageCount = await prisma.productImage.count({
      where: { productId, isActive: true }
    })

    if (currentImageCount + files.length > 5) {
      return NextResponse.json({ ok: false, error: '상품당 최대 5개의 이미지만 등록할 수 있습니다.' }, { status: 400 })
    }

    const uploadedImages = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      // 파일 타입 검증
      if (!file.type.startsWith('image/')) {
        return NextResponse.json({ ok: false, error: '이미지 파일만 업로드할 수 있습니다.' }, { status: 400 })
      }

      // 파일 크기 검증 (5MB 제한)
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json({ ok: false, error: '파일 크기는 5MB를 초과할 수 없습니다.' }, { status: 400 })
      }

      // 파일명 생성 (타임스탬프 + 랜덤코드 + 원본 파일명)
      const timestamp = Date.now() + i
      const randomCode = Math.random().toString(36).substring(2, 8)
      const fileName = `${timestamp}_${randomCode}_${file.name}`
      
      // 외부 업로드 디렉토리에 직접 저장 (빌드와 독립적)
      const uploadDir = '/home/wolmido/uploads/images/product'
      const filePath = path.join(uploadDir, fileName)
      
      // 디렉토리가 없으면 생성
      await mkdir(uploadDir, { recursive: true })
      
      // 파일을 외부 디렉토리에 저장
      console.log('파일 저장 시작:', fileName)
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      await writeFile(filePath, buffer)
      console.log('파일 저장 완료:', filePath)
      
      // 소유자를 www-data로 변경 (웹서버 권한)
      try {
        await chown(filePath, 33, 33) // www-data UID:GID
        console.log('파일 소유자 변경 완료')
      } catch (chownError) {
        console.warn('소유자 변경 실패 (무시하고 계속 진행):', chownError)
      }

      // DB에 이미지 정보 저장
      const image = await prisma.productImage.create({
        data: {
          productId,
          fileName: file.name,
          filePath: `/images/uploaded/product/${fileName}`, // 업로드된 파일 경로 저장
          fileSize: file.size,
          sortOrder: currentImageCount + i,
          isActive: true
        }
      })

      uploadedImages.push(image)
    }

    return NextResponse.json({ 
      ok: true, 
      data: uploadedImages,
      message: `${uploadedImages.length}개의 이미지가 업로드되었습니다.`
    })
  } catch (error) {
    console.error('Upload product images error:', error)
    return NextResponse.json({ ok: false, error: '이미지 업로드에 실패했습니다.' }, { status: 500 })
  }
}