import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken } from '@/lib/auth'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // API 라우트에서 인증이 필요한 경로들 (관리자 로그인 API 제외)
  const protectedApiRoutes = [
    '/api/admin/dashboard',
    '/api/admin/reservations',
    '/api/reservations',
    '/api/orders',
  ]

  // 페이지에서 인증이 필요한 경로들 (관리자 로그인 페이지 제외)
  const protectedPageRoutes = [
    '/admin/dashboard',
    '/admin/reservations',
    '/reservation',
    '/my-reservations',
  ]

  // API 라우트 인증 확인
  if (protectedApiRoutes.some(route => pathname.startsWith(route))) {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({
        ok: false,
        error: '인증 토큰이 필요합니다.',
      }, { status: 401 })
    }

    const payload = verifyAccessToken(token)
    if (!payload) {
      return NextResponse.json({
        ok: false,
        error: '유효하지 않은 토큰입니다.',
      }, { status: 401 })
    }

    // 관리자 권한이 필요한 경로 확인
    if (pathname.startsWith('/api/admin') && payload.role !== 'ADMIN' && payload.role !== 'SUPER_ADMIN') {
      return NextResponse.json({
        ok: false,
        error: '관리자 권한이 필요합니다.',
      }, { status: 403 })
    }

    // 요청 헤더에 사용자 정보 추가
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', payload.id.toString())
    requestHeaders.set('x-user-role', payload.role)

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  // 관리자 로그인 페이지와 API는 인증 없이 접근 가능
  if (pathname === '/admin/login' || pathname === '/api/admin/auth/login') {
    return NextResponse.next()
  }

  // 페이지 라우트 인증 확인
  if (protectedPageRoutes.some(route => pathname.startsWith(route))) {
    const token = request.cookies.get('accessToken')?.value
    
    if (!token) {
      // 관리자 페이지인 경우 관리자 로그인으로 리다이렉트
      if (pathname.startsWith('/admin')) {
        return NextResponse.redirect(new URL('/admin/login', request.url))
      }
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const payload = verifyAccessToken(token)
    if (!payload) {
      // 관리자 페이지인 경우 관리자 로그인으로 리다이렉트
      if (pathname.startsWith('/admin')) {
        return NextResponse.redirect(new URL('/admin/login', request.url))
      }
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // 관리자 페이지 권한 확인
    if (pathname.startsWith('/admin') && payload.role !== 'ADMIN' && payload.role !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/api/admin/:path*',
    '/api/reservations/:path*',
    '/api/orders/:path*',
    '/admin/:path*',
    '/reservation/:path*',
    '/my-reservations/:path*',
  ],
}
