import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAccessToken } from '@/lib/auth'
import { unlink } from 'fs/promises'
import path from 'path'
import { z } from 'zod'

// 개별 이미지 정보 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; imageId: string } }
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
    const imageId = parseInt(params.imageId)

    if (isNaN(productId) || isNaN(imageId)) {
      return NextResponse.json({ ok: false, error: '유효하지 않은 ID입니다.' }, { status: 400 })
    }

    const image = await prisma.productImage.findFirst({
      where: {
        id: imageId,
        productId: productId
      }
    })

    if (!image) {
      return NextResponse.json({ ok: false, error: '이미지를 찾을 수 없습니다.' }, { status: 404 })
    }

    return NextResponse.json({ ok: true, data: image })
  } catch (error) {
    console.error('Get product image error:', error)
    return NextResponse.json({ ok: false, error: '이미지 정보를 가져오는데 실패했습니다.' }, { status: 500 })
  }
}

// 이미지 정보 수정 (순서 변경, 활성화/비활성화)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; imageId: string } }
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
    const imageId = parseInt(params.imageId)

    if (isNaN(productId) || isNaN(imageId)) {
      return NextResponse.json({ ok: false, error: '유효하지 않은 ID입니다.' }, { status: 400 })
    }

    const body = await request.json()
    const updateSchema = z.object({
      sortOrder: z.number().optional(),
      isActive: z.boolean().optional()
    })

    const validatedData = updateSchema.parse(body)

    // 이미지 존재 확인
    const existingImage = await prisma.productImage.findFirst({
      where: {
        id: imageId,
        productId: productId
      }
    })

    if (!existingImage) {
      return NextResponse.json({ ok: false, error: '이미지를 찾을 수 없습니다.' }, { status: 404 })
    }

    const updatedImage = await prisma.productImage.update({
      where: { id: imageId },
      data: validatedData
    })

    return NextResponse.json({ ok: true, data: updatedImage })
  } catch (error) {
    console.error('Update product image error:', error)
    return NextResponse.json({ ok: false, error: '이미지 수정에 실패했습니다.' }, { status: 500 })
  }
}

// 이미지 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; imageId: string } }
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
    const imageId = parseInt(params.imageId)

    if (isNaN(productId) || isNaN(imageId)) {
      return NextResponse.json({ ok: false, error: '유효하지 않은 ID입니다.' }, { status: 400 })
    }

    // 이미지 존재 확인
    const existingImage = await prisma.productImage.findFirst({
      where: {
        id: imageId,
        productId: productId
      }
    })

    if (!existingImage) {
      return NextResponse.json({ ok: false, error: '이미지를 찾을 수 없습니다.' }, { status: 404 })
    }

    // 로컬 파일 삭제 (로컬 경로인 경우에만)
    if (existingImage.filePath.startsWith('/images/')) {
      try {
        const filePath = path.join(process.cwd(), 'public', existingImage.filePath)
        await unlink(filePath)
      } catch (fileError) {
        console.error('File deletion error:', fileError)
        // 파일 삭제 실패해도 DB에서 삭제는 진행
      }
    }

    // DB에서 이미지 정보 삭제
    await prisma.productImage.delete({
      where: { id: imageId }
    })

    return NextResponse.json({ ok: true, message: '이미지가 삭제되었습니다.' })
  } catch (error) {
    console.error('Delete product image error:', error)
    return NextResponse.json({ ok: false, error: '이미지 삭제에 실패했습니다.' }, { status: 500 })
  }
}