import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAccessToken } from '@/lib/auth'
import { put } from '@vercel/blob'

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

    // 상품 존재 확인
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json({ ok: false, error: '상품을 찾을 수 없습니다.' }, { status: 404 })
    }

    const formData = await request.formData()
    const files = formData.getAll('images') as File[]

    if (files.length === 0) {
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

      // 파일명 생성 (타임스탬프 + 원본 파일명)
      const timestamp = Date.now() + i
      const fileName = `${timestamp}_${file.name}`
      const blobPath = `products/${productId}/${fileName}`

      // Vercel Blob에 파일 업로드
      const blob = await put(blobPath, file, {
        access: 'public',
      })

      // DB에 이미지 정보 저장
      const image = await prisma.productImage.create({
        data: {
          productId,
          fileName: file.name,
          filePath: blob.url, // Vercel Blob URL 저장
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