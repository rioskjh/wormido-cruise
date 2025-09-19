import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// 회원 목록 조회
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        ok: false,
        error: '인증 토큰이 필요합니다.',
      }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const payload = verifyToken(token)
    
    if (!payload || (payload.role !== 'ADMIN' && payload.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({
        ok: false,
        error: '관리자 권한이 필요합니다.',
      }, { status: 403 })
    }

    const { searchParams } = request.nextUrl
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search')
    const role = searchParams.get('role')
    const isActive = searchParams.get('isActive')

    const skip = (page - 1) * limit

    const where: any = {}

    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { nickname: { contains: search, mode: 'insensitive' } },
      ]
    }
    if (role) {
      where.role = role
    }
    if (isActive !== undefined && isActive !== null) {
      where.isActive = isActive === 'true'
    }

    const [members, total] = await Promise.all([
      prisma.member.findMany({
        where,
        include: {
          _count: {
            select: {
              reservations: true,
              orders: true,
            }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.member.count({ where }),
    ])

    return NextResponse.json({
      ok: true,
      data: {
        members,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    })

  } catch (error) {
    console.error('Admin members fetch error:', error)
    return NextResponse.json({
      ok: false,
      error: '회원 목록을 불러오는 중 오류가 발생했습니다.',
    }, { status: 500 })
  }
}
